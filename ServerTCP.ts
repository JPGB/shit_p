import { Server as NodeServer, Socket } from "net";

export class ServerTCP {
  private server = new NodeServer();

  constructor(port = 5060) {
    this.server.listen(port, () => {
      console.warn(`Server started on port: ${port}`);
    });

    this.server.on("connection", this.handleServerConnection);
  }

  private handleServerConnection = (socket: Socket) => {
    socket.on("data", (dataBuffer) => {
      this.handleSocketData(dataBuffer, socket);
    });
  };

  private handleSocketData(dataBuffer: Buffer, socket: Socket): Promise<void> {
    return new Promise((resolve, reject) => {
      const [request, ...unparsedHeaders] = dataBuffer
        .toString("utf8")
        .split("\r\n");

      const headers = Object.fromEntries(
        unparsedHeaders.map((header) => {
          const [key, ...value] = header.split(":");
          return [key, value.join(":").trim()];
        })
      );

      const [requestType, uri, requestVersion] = request.split(" ");

      console.warn({ requestType, uri, requestVersion });
      console.warn({ headers });

      // console.warn(JSON.stringify(dataBuffer.toString("utf8")));

      socket.write(
        `${requestVersion} 200 OK\r\nVia: ${headers.Via}\r\nFrom: ${headers.From}\r\nTo: ${headers.To}\r\nCall-ID: ${headers["Call-ID"]}\r\nCSeq: ${headers.CSeq}\r\nServer: testJPerson\r\nContent-Length: 0\r\n\r\n`,
        () => {
          // socket.end();
        }
      );

      console.warn(
        `${requestVersion} 200 OK\r\nVia: ${headers.Via}\r\nFrom: ${headers.From}\r\nTo: ${headers.To}\r\nCall-ID: ${headers["Call-ID"]}\r\nCSeq: ${headers.CSeq}\r\nServer: testJPerson\r\nContent-Length: 0\r\n\r\n`
      );

      resolve();
    });
  }
}
