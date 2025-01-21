import http, { IncomingHttpHeaders } from 'http';
import stream, { Readable } from 'stream';

import { BufferList } from 'bl';
import { OutgoingHttpHeaders } from 'http2';

type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
type ParamsValue = string | undefined;

function isReadableStream(o: unknown): o is Readable {
  return o instanceof Readable;
}

function readRawBody(request: http.IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const bufferList = new BufferList();
    request.on('error', reject);
    request.on('data', (chunk: Buffer) => {
      bufferList.append(chunk);
    });
    request.on('end', () => {
      const buffer = bufferList.slice(0);
      resolve(buffer);
    });
  });
}

interface IIncomingMessage {
  url: string;
  params: Record<string, ParamsValue>;
  method: HTTPMethod;
  headers: IncomingHttpHeaders;
  query?: Record<string, string | undefined>;
  body?: Promise<Buffer>;
}

type IncomingMessage = IIncomingMessage;

export function buildIncomingMessage(message: http.IncomingMessage, params?: Record<string, ParamsValue>): IIncomingMessage {
  const incomingMessage: IIncomingMessage = {
    url: message.url || '/',
    params: params || {},
    method: (message.method || 'GET').toUpperCase() as HTTPMethod,
    headers: message.headers
  };

  // TODO: check memory leak

  if (
    isReadableStream(message) &&
    ['POST', 'PUT'].includes(incomingMessage.method)
  ) {
    let bodyCache: Promise<Buffer> | undefined = undefined;
    Object.defineProperty(incomingMessage, 'body', {
      enumerable: true,
      get: () => {
        if (!bodyCache) { bodyCache = readRawBody(message); }
        return bodyCache;
      }
    });
  }

  // TODO: parse query in getter
  // get query(): { [key in string]: string | undefined; } {
  //   const url = new URL(this.url, 'http://localhost');
  //   return querystring.parse(url.search.slice(1));
  // }

  return incomingMessage;
}

type OutgoingMessageContent = string | Buffer | stream.Readable | null | undefined;

interface IOutgoingMessage {
  status: number;
  headers: OutgoingHttpHeaders;
  content: OutgoingMessageContent;
}

type OutgoingMessage = IOutgoingMessage;

type AnyForOutgoingMessage = Partial<IOutgoingMessage> | OutgoingMessageContent | void;

export function buildOutgoingMessage(message: AnyForOutgoingMessage): IOutgoingMessage {
  let outgoingMessage: IOutgoingMessage;
  if (!message) {
    outgoingMessage = { status: 204, headers: {}, content: '' };
  } else if (typeof message === 'string') {
    outgoingMessage = {
      status: 200,
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'content-length': message.length.toString()
      },
      content: message
    };
  } else if (Buffer.isBuffer(message) || isReadableStream(message)) {
    outgoingMessage = {
      status: 200,
      headers: {
        'content-type': 'application/octet-stream'
      },
      content: message
    };
  } else {
    const maybeOutgoingMessage = message as Partial<IOutgoingMessage>;
    const maybeContentIsString = typeof maybeOutgoingMessage.content === 'string' || maybeOutgoingMessage.content == null;
    outgoingMessage = {
      status: maybeOutgoingMessage.status || 200,
      headers: maybeOutgoingMessage.headers || {
        'content-type': maybeContentIsString ? 'text/plain; charset=utf-8' : 'application/octet-stream'
      },
      content: maybeOutgoingMessage.content || ''
    };
  }
  return outgoingMessage;
}

export async function applyOutgoingMessage(message: IOutgoingMessage, response: http.ServerResponse): Promise<void> {
  return new Promise((resolve, reject) => {
    response.on('error', reject);
    response.on('finish', resolve);
    response.writeHead(message.status, message.headers);
    if (message.content) {
      if (isReadableStream(message.content)) {
        message.content.pipe(response);
      } else {
        response.write(message.content);
        response.end();
      }
    } else {
      response.end();
    }
  });
}

export type {
  IIncomingMessage,
  IOutgoingMessage,
  IncomingMessage,
  OutgoingMessage,
  AnyForOutgoingMessage
};
