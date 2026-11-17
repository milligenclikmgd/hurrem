'use strict';
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const {WebSocketServer}=require('ws');
const {TikTokLiveConnection}=require('tiktok-live-connector');
const HOST='127.0.0.1',PORT=8765,REMOTE='https://milligenclikmgd.github.io/hurrem/';
const configPath=path.join(__dirname,'gifts.json');
const config=JSON.parse(fs.readFileSync(configPath,'utf8'));
const clients=new Set();
function broadcast(data){const msg=JSON.stringify(data);for(const ws of clients)if(ws.readyState===1)ws.send(msg);}
function status(message){console.log('[DURUM]',message);broadcast({type:'status',message});}
function sendGift(gift){
 const event={type:'gift',uniqueId:String(gift.uniqueId||'').replace(/^@/,''),giftName:String(gift.giftName||''),giftId:String(gift.giftId||''),diamondCount:gift.diamondCount||0};
 if(!event.uniqueId)return;
 console.log('[HEDIYE]',event.uniqueId,event.giftName,'ID:',event.giftId,'Elmas:',event.diamondCount);
 broadcast(event);
}
const server=http.createServer(async(req,res)=>{
 const u=new URL(req.url,'http://'+HOST+':'+PORT);
 if(u.pathname==='/command'&&req.method==='POST'){
  let raw='';req.on('data',chunk=>{raw+=chunk;if(raw.length>4096)req.destroy()});
  req.on('end',()=>{try{const cmd=JSON.parse(raw);if(!['join','start','march','music','stopMusic','cameraReset'].includes(cmd.type))throw Error('Geçersiz komut');broadcast({type:'command',command:cmd});res.writeHead(200,{'Content-Type':'application/json'});res.end('{"ok":true}')}catch(e){res.writeHead(400);res.end('Geçersiz istek')}});
  return;
 }
 if(u.pathname==='/health'){res.writeHead(200,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify({ok:true,account:config.account,viewers:clients.size}));return;}
 if(u.pathname==='/test'){
  const user=(u.searchParams.get('user')||'deneme').slice(0,24);
  const gift=(u.searchParams.get('gift')||'rose').slice(0,80);
  sendGift({uniqueId:user,giftName:gift,giftId:gift});
  res.writeHead(200,{'Content-Type':'text/plain; charset=utf-8'});res.end('Test hediyesi gönderildi: '+user+' / '+gift);return;
 }
 // GitHub Pages oyununu yerel HTTP üzerinden servis eder: ws mixed-content problemi olmaz.
 try{
  const upstream=new URL(u.pathname.replace(/^\//,'')+u.search,REMOTE);
  const r=await fetch(upstream,{signal:AbortSignal.timeout(20000)});
  res.writeHead(r.status,{'Content-Type':r.headers.get('content-type')||'application/octet-stream','Cache-Control':'no-store'});
  res.end(Buffer.from(await r.arrayBuffer()));
 }catch(err){res.writeHead(502,{'Content-Type':'text/plain; charset=utf-8'});res.end('Oyun indirilemedi: '+err.message);}
});
const wss=new WebSocketServer({server,path:'/live'});
wss.on('connection',ws=>{clients.add(ws);ws.send(JSON.stringify({type:'config',config}));ws.send(JSON.stringify({type:'status',message:'Yerel köprü bağlı. TikTok LIVE bağlantısı deneniyor.'}));ws.on('close',()=>clients.delete(ws));});
server.listen(PORT,HOST,()=>console.log('OYUN: http://'+HOST+':'+PORT+'\nTEST: http://'+HOST+':'+PORT+'/test?user=deneme&gift=rose'));
let live,backoff=5000;
async function connect(){
 try{
  live=new TikTokLiveConnection(config.account,{enableExtendedGiftInfo:true});
  live.on('gift',data=>{
   // Streak hediyeleri yalnız tamamlandığında bir kez işlenir.
   if(data.giftType===1&&data.repeatEnd!==true&&data.repeatEnd!==1)return;
   const giftName=data.giftName||data.gift?.name||'';
   const giftId=data.giftId||data.gift?.id||'';
   sendGift({uniqueId:data.uniqueId||data.user?.uniqueId,giftName,giftId,diamondCount:data.diamondCount});
  });
  live.on('disconnected',()=>{status('TikTok bağlantısı koptu; yeniden bağlanılacak');setTimeout(connect,backoff);});
  live.on('error',e=>console.error('[TIKTOK HATA]',e?.message||e));
  await live.connect();backoff=5000;status('@'+config.account+' LIVE yayınına bağlandı');
 }catch(e){status('LIVE bağlantısı kurulamadı: '+(e?.message||e)+' | 15 saniye sonra tekrar denenecek');setTimeout(connect,15000);}
}
connect();
