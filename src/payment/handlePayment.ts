import { InvoicesService } from 'src/invoices/invoices.service';
import { User } from 'src/users/entities/user.entity';

export class HandlePayment {
  constructor(private readonly invoicesService: InvoicesService, user: User) {}
  async shopPayment({ amount, paymentMethodId, products, user, coupon, site }) {
    try {
      await this.invoicesService.create(
        {
          note: 'Online payment',
          type: 'shop',
          donepayment: true,
          user: user,
          issuedate: new Date(),
          duedate: new Date(),
          coupon,
          items: products,
          paymenttype: 'online',
          invoicenumber: Math.floor(Math.random() * 99999) + 1,
          site,
        },
        user,
      );

      return { status: true };
    } catch (err) {
      throw new Error(err.message);
    }
  }
}
