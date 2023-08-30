/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from 'src/items/entities/item.entity';
import { ItemsService } from 'src/items/items.service';
import { Order } from 'src/orders/entities/order.entity';
import { OrdersService } from 'src/orders/orders.service';
import { Product } from 'src/product/entities/product.entity';
import { Setting } from 'src/settings/entities/setting.entity';
import { SettingsService } from 'src/settings/settings.service';
import { ShippingsService } from 'src/shippings/shippings.service';
import { Repository } from 'typeorm';
import { CreateInvoiceInput } from './dto/create-invoice.input';
import { GetInoivceArgs } from './dto/get-invoice';
import { GetInvoicesArgs } from './dto/get-invoices.args';
import { UpdateInvoiceInput } from './dto/update-invoice.input';
import { Invoice } from './entities/invoice.entity';
import { CouponsService } from 'src/coupons/coupons.service';
import { EventsService } from 'src/events/events.service';
import { ChatsService } from 'src/chats/chats.service';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private readonly settingService: SettingsService,
    private readonly couponService: CouponsService,
    private readonly chatService: ChatsService,
    private readonly shippingService: ShippingsService,
    private readonly itemService: ItemsService,
    private readonly orderService: OrdersService,
  ) {}

  async create(
    createInvoiceInput: CreateInvoiceInput,
    user: User,
  ): Promise<Invoice> {
    const setting = await this.settingRepository.find({
      skip: 0,
      take: 1,
      order: { created: 'DESC' },
    });

    const coupon = createInvoiceInput.coupon
      ? await this.couponService.findOne(createInvoiceInput.coupon)
      : null;
    const shipping = createInvoiceInput.shipping
      ? await this.shippingService.findOne(createInvoiceInput.shipping)
      : null;

    const items = createInvoiceInput.items;
    let subtotal = 0;
    let total = 0;

    if (items.length > 0) {
      items.map(async (item) => {
        // TODO: If we want to check with database
        // const product = await this.productRepository.findOne({
        //   // @ts-ignore I know what is inside the bag
        //   where: { id: item.product },
        // });

        // @ts-ignore
        const qty = item.quantity;
        // @ts-ignore
        const price = item.price;

        subtotal = subtotal + price * qty;
      });
    } else {
      throw new Error('No item selected');
    }
    total = subtotal;
    if (coupon) total = total - (total * coupon.percent) / 100;

    const tax = (total * setting[0]?.tax) / 100;
    total = total + tax;
    if (shipping) total = total + shipping.cost;

    // Create Order
    const order = await this.orderService.create({
      totalprice: total,
      subtotal: subtotal,
      coupon: coupon,
      shipping: shipping,
      user: createInvoiceInput.user,
      payment: null,
      status: false,
    });

    if (items.length > 0) {
      items.map(async (item) => {
        await this.itemService.create({
          // @ts-ignore
          event: item.product,
          // @ts-ignore
          quantity: item.quantity,
          // @ts-ignore
          price: item.price,
          order: order,
        });
      });
    }

    const item = await this.invoiceRepository.create({
      ...createInvoiceInput,
      total,
      user: createInvoiceInput.user,
      order: order,
      coupon,
    });

    await this.chatService.createInvoice(
      {
        priority: 'high',
        type: 'invoice',
        from: user,
        to: [createInvoiceInput.user],
        subject: 'فاکتور',
        invoice: item,
        sms: true,
        email: true,
        repliable: true,
        closed: false,
        body: `فاکتور شماه #${item.invoicenumber}<br>
          مبلغ: ${item.total} تومان <br>
          ${item.type === 'event' ? 'رویداد' : 'فروشگاه'}<br>
          صادر شد
        `,
        status: true,
        system: true,
        department: null,
      },
      user,
    );

    try {
      return await this.invoiceRepository.save(item);
    } catch (err) {
      if (err.code === '23505') {
        throw new ConflictException('Duplicate error');
      }
    }
  }

  async findAll({ skip, limit, searchTerm, type }: GetInvoicesArgs) {
    const [result, total] = await this.invoiceRepository.findAndCount({
      where: {
        invoicenumber: searchTerm ? parseInt(searchTerm) : null,
        type: type,
      },
      relations: ['user', 'order'],
      order: { id: 'DESC' },
      take: limit,
      skip: skip,
    });

    return { invoices: result, count: total };
  }

  async findOne(getInvoiceArgs: GetInoivceArgs): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id: getInvoiceArgs.id },
      relations: [
        'user',
        'order',
        'order.items',
        'order.items.product',
        'order.coupon',
        'order.shipping',
      ],
    });
    if (!invoice) {
      throw new NotFoundException(`Invoice #${getInvoiceArgs.id} not found`);
    }

    if (getInvoiceArgs.read) {
      const order = await this.orderRepository.findOneBy({
        id: invoice.order.id,
      });
      if (order) {
        order.readat = new Date();
        await this.orderRepository.save(order);
      }
      invoice.readat = new Date();

      await this.invoiceRepository.save(invoice);
    }

    return invoice;
  }

  async update(id: number, updateInvoiceInput: UpdateInvoiceInput) {
    const coupon = await this.couponService.findOne(updateInvoiceInput.coupon);
    const order = await this.orderService.findOne({
      id: updateInvoiceInput.order,
      read: false,
    });

    const setting = await this.settingRepository.findOneOrFail({
      where: { id: 1 },
    });

    const shipping = await this.shippingService.findOne(
      updateInvoiceInput.shipping,
    );

    const items = updateInvoiceInput.items;
    let subtotal = 0;
    let total = 0;

    if (items.length > 0) {
      items.map(async (item) => {
        // TODO: If we want to check with database
        // const product = await this.productRepository.findOne({
        //   // @ts-ignore I know what is inside the bag
        //   where: { id: item.product },
        // });

        // @ts-ignore
        const qty = item.quantity;
        // @ts-ignore
        const price = item.price;

        subtotal = subtotal + price * qty;
      });
    } else {
      throw new Error('No item selected');
    }
    total = subtotal;
    if (coupon) total = total - (total * coupon.percent) / 100;
    const tax = (total * setting?.tax) / 100;
    total = total + tax;
    if (shipping) total = total + shipping.cost;

    await this.orderRepository
      .createQueryBuilder('order')
      .update({
        totalprice: total,
        subtotal: subtotal,
        coupon: coupon,
        shipping: shipping,
      })
      .where({ id: updateInvoiceInput.order })
      .returning('*')
      .execute();

    if (items.length > 0) {
      items.map(async (item) => {
        if (updateInvoiceInput.type === 'shop') {
          // @ts-ignore
          if (item.id) {
            // @ts-ignore
            await this.itemService.update(item.id, {
              // @ts-ignore
              product: item.product?.value ?? item.product,
              // @ts-ignore
              quantity: item.quantity,
              // @ts-ignore
              price: item.price,
              order: order,
            });
          } else {
            await this.itemService.create({
              // @ts-ignore
              product: item.product?.value ?? item.product,
              // @ts-ignore
              quantity: item.quantity,
              // @ts-ignore
              price: item.price,
              order: order,
            });
          }
        } else {
          // @ts-ignore
          if (item.id) {
            // @ts-ignore
            await this.itemService.update(item.id, {
              // @ts-ignore
              event: item.product?.value ?? item.product,
              // @ts-ignore
              quantity: item.quantity,
              // @ts-ignore
              price: item.price,
              order: order,
            });
          } else {
            await this.itemService.create({
              // @ts-ignore
              event: item.product?.value ?? item.product,
              // @ts-ignore
              quantity: item.quantity,
              // @ts-ignore
              price: item.price,
              order: order,
            });
          }
        }
      });
    }

    const invoice = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .update({
        note: updateInvoiceInput.note,
        salesperson: updateInvoiceInput.salesperson,
        type: updateInvoiceInput.type,
        paymenttype: updateInvoiceInput.paymenttype,
        invoicenumber: updateInvoiceInput.invoicenumber,
        user: updateInvoiceInput.user,
        total: total,
        issuedate: updateInvoiceInput.issuedate,
        duedate: updateInvoiceInput.duedate,
        donepayment: updateInvoiceInput.donepayment,
        readat: new Date(),
      })
      .where({ id: id })
      .returning('*')
      .execute();

    if (!invoice) {
      throw new NotFoundException(`Invoice #${id} not found`);
    }
    return invoice.raw[0];
  }

  async remove(id: number): Promise<boolean> {
    const invoice = await this.invoiceRepository.findOneBy({ id: id });

    await this.invoiceRepository.remove(invoice);
    return true;
  }
}
