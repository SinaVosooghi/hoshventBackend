import {
  ConflictException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { CreateAtendeeInput } from "./dto/create-atendee.input";
import { GetAttendeesArgs } from "./dto/get-attendees.args";
import { UpdateAttendeeInput } from "./dto/update-atendee.input";
import { Attendee } from "./entities/attendee.entity";
import { Site } from "src/sites/entities/site.entity";
import { Workshop } from "src/workshops/entities/workshop.entity";
import { Seminar } from "src/seminars/entities/seminar.entity";
import { User } from "../users/entities/user.entity";

@Injectable()
export class AttendeesService {
  constructor(
    @InjectRepository(Attendee)
    private readonly AttendeeRepository: Repository<Attendee>,
    @InjectRepository(Workshop)
    private readonly workshopRepository: Repository<Workshop>,
    @InjectRepository(Seminar)
    private readonly seminarRepository: Repository<Seminar>
  ) {
  }

  async create(createAttendeeInput: CreateAtendeeInput): Promise<Attendee> {
    const item = await this.AttendeeRepository.create(createAttendeeInput);

    try {
      return await this.AttendeeRepository.save(item);
    } catch (err) {
      if (err.code === "23505") {
        throw new ConflictException("Duplicate error");
      }
    }
  }

  async findAll({ skip, limit, status, siteid, w, s }: GetAttendeesArgs, user?: User) {

    const [result, total] = await this.AttendeeRepository.findAndCount({
      where: {
        status: status ?? null,
        ...(siteid && { site: { id: siteid } }),
        ...(w && { workshop: { id: w } }),
        ...(s && { seminar: { id: s } }),
        ...(user && { site: { id: user.site[0]?.id } }),
      },
      order: { id: "DESC" },
      relations: ["user"],
      take: limit,
      skip: skip
    });

    return { attends: result, count: total };
  }

  async findAllApi({ skip, limit, status, siteid, w, s }: GetAttendeesArgs) {
    if (w) {
      const workshops = await this.workshopRepository.find({
        where: {
          ...(siteid && { site: { id: siteid } }),
          ...(w && { id: w })
        },
        relations: ["user"],
        select: { id: true }
      });

      const ids = workshops.map((c) => c.id);
      const [result, total] = await this.AttendeeRepository.findAndCount({
        where: {
          status: status ?? null,
          workshop: {
            id: In(ids)
          }
        },
        order: { id: "DESC" },
        relations: ["user", "workshop"],
        take: limit,
        skip: skip
      });

      return { attends: result, count: total };
    } else if (s) {
      const seminars = await this.seminarRepository.find({
        where: {
          ...(siteid && { site: { id: siteid } }),
          ...(s && { id: s })
        },
        relations: ["user"],
        select: { id: true }
      });

      const ids = seminars.map((c) => c.id);
      const [result, total] = await this.AttendeeRepository.findAndCount({
        where: {
          status: status ?? null,
          seminar: {
            id: In(ids)
          }
        },
        order: { id: "DESC" },
        relations: ["user", "seminar"],
        take: limit,
        skip: skip
      });

      return { attends: result, count: total };
    }

    const [result, total] = await this.AttendeeRepository.findAndCount({
      where: {
        status: status ?? null,
        ...(siteid && { site: { id: siteid } })
      },
      order: { id: "DESC" },
      relations: ["user", "seminar", "workshop"],
      take: limit,
      skip: skip
    });

    return { attends: result, count: total };
  }

  async findOne(id: number): Promise<Attendee> {
    const Attendee = await this.AttendeeRepository.findOne({
      where: { id: id }
    });
    if (!Attendee) {
      throw new NotFoundException(`Attendee #${id} not found`);
    }
    return Attendee;
  }

  async update(
    id: number,
    updateAttendeeInput: UpdateAttendeeInput
  ): Promise<Attendee> {
    const Attendee = await this.AttendeeRepository.createQueryBuilder(
      "Attendee"
    )
      .update(updateAttendeeInput)
      .where({ id: id })
      .returning("*")
      .execute();

    if (!Attendee) {
      throw new NotFoundException(`Attendee #${id} not found`);
    }
    return Attendee.raw[0];
  }

  async remove(id: number): Promise<boolean> {
    const Attendee = await this.AttendeeRepository.findOneBy({ id: id });

    await this.AttendeeRepository.remove(Attendee);
    return true;
  }
}
