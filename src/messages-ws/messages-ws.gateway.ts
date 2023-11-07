import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { MessagesWsService } from './messages-ws.service';
import { NewMessageDTO } from './dtos/new-message.dto';
import { JwtPayload } from 'src/auth/interfaces';

@WebSocketGateway({ cors: true, namespace: '/' }) //! El namespace es '/' por defecto
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  
  @WebSocketServer() wss: Server;
  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService
  ) {}

  async handleConnection( client: Socket ) {
    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload;

    try {
      payload = this.jwtService.verify( token );      
      await this.messagesWsService.registerClient( client, payload.id );

    } catch ( error ) {
      client.disconnect();
      return;
    }

    // client.join( 'ventas' );
    // client.join( client.id ); //* Por defecto el cliente se une a una sala con el id del socket 
    // client.join( user.email ); //* Si se autentica el usuario, lo podemos unir a una sala que sea su email...

    this.wss.to( 'ventas' ).emit('');
    this.wss.emit( 'clients-updated', this.messagesWsService.getConnectedClients() );
  }

  handleDisconnect( client: Socket ) {
    this.messagesWsService.removeClient( client.id );
    this.wss.emit( 'clients-updated', this.messagesWsService.getConnectedClients() );
  }

  @SubscribeMessage( 'message-from-client' )
  onMessageFromClient( client: Socket, payload: NewMessageDTO ) {
    
    //! Emite únicamente al cliente
    // client.emit( 'message-from-server', {
    //   fullName: 'Soy Yo!',
    //   message: payload.message || 'no-message!!'
    // });

    //! Emitir a todos MENOS, al cliente inicial
    // client.broadcast.emit( 'message-from-server', {
    //   fullName: 'Soy Yo!',
    //   message: payload.message || 'no-message!!'
    // });

    console.log( payload );

    //! Emitir a TODOS los clientes
    this.wss.emit( 'message-from-server', {
      fullName: this.messagesWsService.getUserFullName( client.id ),
      message: payload.message || 'no-message!!'
    });
    
  }

  
}
