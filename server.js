const http = require('http');
const Koa = require('koa');
const koaBody = require('koa-body');
const app = new Koa();
const formatDate = require("./formatDate");
const { stat } = require('fs');

// => Static file handling
// const public = path.join(__dirname, '/public')
// app.use(koaStatic(public));

// => CORS
 app.use(async (ctx, next) => {
   const origin = ctx.request.get('Origin');
   if (!origin) {
     return await next();
   }

   const headers = { 'Access-Control-Allow-Origin': '*', };

   if (ctx.request.method !== 'OPTIONS') {
     ctx.response.set({...headers});
     try {
       return await next();
     } catch (e) {
       e.headers = {...e.headers, ...headers};
       throw e;
     }
   }

   if (ctx.request.get('Access-Control-Request-Method')) {
     ctx.response.set({
       ...headers,
       'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
     });
     if (ctx.request.get('Access-Control-Request-Headers')) {
       ctx.response.set('Access-Control-Allow-Headers', ctx.request.get('Access-Control-Request-Headers'));
     }

     ctx.response.status = 204;
   }
 });

// => Body Parsers
 app.use(koaBody({
   text: true,
   urlencoded: true,
   multipart: true,
   json: true,
 }));

// => GET/POST
 const tickets = [];
 app.use(async (ctx, next) => {
  console.log(ctx.request.querystring);
  if (ctx.request.method !== 'GET') {
    try {
     return await next();
   } catch (e) {
      throw e;
}
  }
   const { method, id } = ctx.request.query;
   console.log(method);
// const { name, phone } = ctx.request.body;  // for POST
   if(method === "allTickets"){
    ctx.response.body = JSON.stringify(tickets);
    ctx.response.status = 200;
    return;
   }
   if(method === "ticketById"){
    let ticket;
    for(let item of tickets){
      if(item.id === Number(id)){
        ticket = item;
    }
  }
    ctx.response.body = ticket;
    ctx.response.status = 200;
    return;
   }
   if(method === "deleteById"){
    for(let item of tickets){
      if(item.id === Number(id)){
        tickets.pop(item);
      }
    }
    ctx.response.body = JSON.stringify(tickets);
    ctx.response.status = 204;
    return;
   }
   ctx.response.body = 'Ok';
 });

 app.use(async (ctx, next) => {
  console.log(ctx.request.querystring);
  if (ctx.request.method !== 'POST') {
    try {
     return await next();
   } catch (e) {
      e.headers = {...e.headers, ...headers};
      throw e;
}
  }
   const { method, id } = ctx.request.query;
   console.log(method);
   if(method === "createTicket"){
    let {name, description} = ctx.request.body;
    if(tickets.some(ticket => ticket.name === name)){
      ctx.response.body = "Ticket with this name exists!";
      ctx.response.status = 400;
      return;
    }
    let date = new Date();
    tickets.push({
      id: tickets.length + 1,
      name,
      status: false,
      description,
      date: formatDate(date)
    })
    ctx.response.status = 200;
    return;
   }
   if(method === "changeTicket"){
    console.log(ctx.request.body);
    let {name, description} = ctx.request.body;
    let status;
    if(!(name&&description)){
      status = JSON.parse(ctx.request.body).status;
    }
    if(tickets.some(ticket => ticket.name === name)){
      ctx.response.body = "Ticket with this name exists!";
      ctx.response.status = 400;
      return;
    }
    if(tickets.every(ticket => ticket.id !== Number(id))){
      ctx.response.body = "Ticket with this id doesn't exists!";
      ctx.response.status = 401;
      return;
    }
    if(name && description){
      let date = new Date();
    for(let item of tickets){
      if(item.id === Number(id)){
        item.name = name;
        item.description = description;
        item.date = formatDate(date);
      }
    }
      console.log(tickets)
      ctx.response.status = 201;
      return;
    }
    if(JSON.stringify(status)){
      for(let item of tickets){
        if(item.id === Number(id)){
          item.status = status
        }
    }
    console.log(tickets)  
    ctx.response.status = 201;
      return;
    }
    
   }
   ctx.response.body = 'Ok';
 });

// => File Uploading
// app.use(async ctx => {
//   const { name } = ctx.request;
//   const { file } = ctx.request.files;
//   const link = await new Promise((resolve, reject) => {
//     const oldPath = file.path;
//     const filename = uuid.v4();
//     const newPath = path.join(public, filename);

//     const callback = (error) => reject(error);

//     const readStream = fs.createReadStream(oldPath);
//     const writeStream = fs.createWriteStream(newPath);

//     readStream.on('error', callback);
//     writeStream.on('error', callback);

//     readStream.on('close', () => {
//       console.log('close');
//       fs.unlink(oldPath, callback);
//       resolve(filename);
//     });

//     readStream.pipe(writeStream);
//   });

//   ctx.response.body = link;
// });

const port = process.env.PORT || 1001;
http.createServer(app.callback()).listen(port)