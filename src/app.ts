import * as express from "express";
import { Request, Response } from "express";
import { createConnection, getManager } from "typeorm";
import { User } from "./entity/User";
import { Event } from "./entity/Event";
import { Ticket } from "./entity/Ticket";
import { v4 as uuidv4 } from "uuid";
import cors = require("cors");
import { transporter } from "./utils/mailsender";
import { generateQR } from "./config/qrcode";

// create typeorm connection
const isAuthenticated = async (
  email: string,
  password: string,
  userRepository
) => {
  const user = await userRepository
    .createQueryBuilder("User")
    .where("User.email = :email", { email: email })
    .getOne();

  if (!user) {
    return false;
  }

  if (user.password !== password) {
    return false;
  }

  return true;
};

createConnection().then((connection) => {
  // create and setup express app
  const app = express();
  app.use(express.json());
  app.use(
    cors({
      origin: "*",
    })
  );

  const userRepository = connection.getRepository(User);
  const eventsRepository = connection.getRepository(Event);
  const ticketsRepository = connection.getRepository(Ticket);
  // register routes

  // app.get("/users", async function (req: Request, res: Response) {
  //   const users = await userRepository.find();
  //   res.json(users);
  // });

  // app.get("/users/:id", async function (req: Request, res: Response) {
  //   const results = await userRepository.findOneById(req.params.id);
  //   return res.send(results);
  // });

  app.post("/registration", async function (req: Request, res: Response) {
    try {
      await userRepository.save(req.body);
      return res.send(true);
    } catch (error) {
      return res.status(500).send(false);
    }
  });

  app.post("/authentication", async function (req: Request, res: Response) {
    try {
      return res.send(
        await isAuthenticated(req.body.email, req.body.password, userRepository)
      );
    } catch (error) {
      return res.status(500).send(false);
    }
  });

  // app.put("/users/:id", async function (req: Request, res: Response) {
  //   const user = await userRepository.findOneById(req.params.id);
  //   userRepository.merge(user, req.body);
  //   const results = await userRepository.save(user);
  //   return res.send(results);
  // });

  // app.delete("/users/:id", async function (req: Request, res: Response) {
  //   const results = await userRepository.delete(req.params.id);
  //   return res.send(results);
  // });

  // Events

  app.get("/events", async function (req: Request, res: Response) {
    try {
      const events = await eventsRepository.find();
      res.json(events);
    } catch (error) {
      return res.status(500).send(false);
    }
  });

  app.get("/events/:id", async function (req: Request, res: Response) {
    try {
      const event = await eventsRepository.findOneById(req.params.id);

      // const entityManager = getManager();
      // const tickets = await entityManager.query(
      //   `SELECT t FROM ticket as t WHERE t.eventId = ?`,
      //   [event.id]
      // );
      // console.log(JSON.stringify(tickets));

      const tickets = await ticketsRepository
        .createQueryBuilder("Ticket")
        .where("Ticket.eventId = :eventId", { eventId: event.id })
        .getMany();

      const updatedTickets = [];
      const entityManager = getManager();

      for (const ticket of tickets) {
        const response = await entityManager.query(
          `SELECT t.userId FROM ticket as t WHERE t.id = ?`,
          [ticket.id]
        );
        const user = await userRepository.findOneById(response[0].userId);
        updatedTickets.push({ ...ticket, name: user.name });
      }

      console.log(JSON.stringify(updatedTickets));

      return res.send({ ...event, tickets: updatedTickets });
    } catch (error) {
      return res.status(500).send(false);
    }
  });

  app.post("/events", async function (req: Request, res: Response) {
    try {
      const { email, password, ...payload } = req.body;

      if (!isAuthenticated(email, password, userRepository)) {
        return res.status(401).send({ message: "Nu esti autentificat!" });
      }

      const user = await userRepository
        .createQueryBuilder("User")
        .where("User.email = :email", { email: email })
        .getOne();

      try {
        const event = await eventsRepository.save({
          ...payload,
          owner: email,
          user,
          state: 0,
        });

        if (payload.banner) {
          await eventsRepository.update(event.id, {
            banner: `${event.id}/${payload.banner}`,
          });

          return res.send(await eventsRepository.findOneById(event.id));
        }

        return res.send(event);
      } catch (error) {
        console.log(error);
        return res
          .status(400)
          .send({ message: "eroare la adaugarea evenimentului" });
      }
    } catch (error) {
      return res.status(500).send(false);
    }
  });

  // app.put("/event/:id", async function (req: Request, res: Response) {
  //   const event = await eventsRepository.findOneById(req.params.id);
  //   eventsRepository.merge(event, req.body);
  //   const results = await eventsRepository.save(event);
  //   return res.send(results);
  // });

  // app.delete("/events/:id", async function (req: Request, res: Response) {
  //   const results = await eventsRepository.delete(req.params.id);
  //   return res.send(results);
  // });
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  app.get("/tickets", async function (req: Request, res: Response) {
    try {
      const ticket = await ticketsRepository.find();
      res.json(ticket);
    } catch (error) {
      return res.status(500).send(false);
    }
  });

  app.get("/tickets/:id", async function (req: Request, res: Response) {
    try {
      const results = await ticketsRepository.findOneById(req.params.id);
      return res.send(results);
    } catch (error) {
      return res.status(500).send(false);
    }
  });

  app.patch("/tickets/:id", async function (req: Request, res: Response) {
    try {
      const newState = req.body.state;

      const ticket = await ticketsRepository.findOneById(req.params.id);
      const updatedTicket = await ticketsRepository.save({
        ...ticket,
        state: newState,
      });

      const entityManager = getManager();
      const response = await entityManager.query(
        `SELECT t.userId FROM ticket as t WHERE t.id = ?`,
        [ticket.id]
      );

      const userId = response[0].userId;

      if (newState === 1) {
        const user = await userRepository.findOneById(userId);
        const qrLink = `http://localhost:3005/validare-bilet/${ticket.secretCode}`;
        const userEmail = user.email;

        let qr = await generateQR(qrLink);
        qr = qr.replace(/^data:image\/(png|jpg);base64,/, "");
        let mail = {
          from: "EventsApp",
          to: userEmail,
          subject: "Event attendance pass",
          attachments: [
            {
              filename: "Ticket.jpg",
              content: qr,
              encoding: "base64",
            },
          ],
          text: "Send email",
        };

        await transporter.sendMail(mail, (err, data) => {
          if (err) {
            res.send({
              status: "fail",
              error: err,
            });
          } else {
            res.json({
              status: "success",
            });
          }
        });
      }

      return res.send(updatedTicket);
    } catch (error) {
      return res.status(500).send(false);
    }
  });

  app.post("/tickets", async function (req: Request, res: Response) {
    try {
      //TODO get user id from token
      const { email, password, ...payload } = req.body;

      if (!isAuthenticated(email, password, userRepository)) {
        return res.status(401).send({ message: "Nu esti autentificat!" });
      }

      const user = await userRepository
        .createQueryBuilder("User")
        .where("User.email = :email", { email: email })
        .getOne();

      const event = await eventsRepository.findOneById(payload.eventId);

      const ticket = await ticketsRepository.save({
        ...payload,
        secretCode: uuidv4(),
        state: 0,
        user,
        event,
      });

      return res.send(ticket);
    } catch (error) {
      return res.status(500).send(false);
    }
  });

  app.put("/tickets/:id", async function (req: Request, res: Response) {
    try {
      const ticket = await ticketsRepository.findOneById(req.params.id);
      ticketsRepository.merge(ticket, req.body);
      const results = await ticketsRepository.save(ticket);
      return res.send(results);
    } catch (error) {
      return res.status(500).send(false);
    }
  });

  app.delete("/tickets/:id", async function (req: Request, res: Response) {
    try {
      const results = await ticketsRepository.delete(req.params.id);
      return res.send(results);
    } catch (error) {
      return res.status(500).send(false);
    }
  });

  app.listen(3001);
});
