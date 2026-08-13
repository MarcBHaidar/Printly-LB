import { createHmac, timingSafeEqual } from "node:crypto";
import {pbkdf2Sync,randomBytes} from "node:crypto";import {db} from "./projects";
const COOKIE_NAME="printly_admin",MAX_AGE=60*10;
function secret(){const value=process.env.ADMIN_SESSION_SECRET;if(!value)throw new Error("ADMIN_SESSION_SECRET is not configured");return value;}
function sign(value:string){return createHmac("sha256",secret()).update(value).digest("hex");}
function equal(a:string,b:string){const left=Buffer.from(a),right=Buffer.from(b);return left.length===right.length&&timingSafeEqual(left,right);}
// Stored credentials win when they exist. If the lookup fails — no DATABASE_URL,
// or db/schema.sql has not been run yet — fall back to the ADMIN_USERNAME /
// ADMIN_PASSWORD bootstrap pair rather than failing the whole request.
export async function validCredentials(username:string,password:string){let rows:{username:string;password_hash:string;salt:string}[]=[];try{rows=await db().query(`SELECT username,password_hash,salt FROM admin_credentials WHERE id=1`) as typeof rows;}catch{rows=[];}if(rows[0])return equal(username,rows[0].username)&&equal(pbkdf2Sync(password,rows[0].salt,210000,32,"sha256").toString("hex"),rows[0].password_hash);const user=process.env.ADMIN_USERNAME||"",pass=process.env.ADMIN_PASSWORD||"";return Boolean(user&&pass&&equal(username,user)&&equal(password,pass));}
export async function changeCredentials(username:string,password:string){const salt=randomBytes(16).toString("hex"),hash=pbkdf2Sync(password,salt,210000,32,"sha256").toString("hex");await db().query(`INSERT INTO admin_credentials(id,username,password_hash,salt) VALUES(1,$1,$2,$3) ON CONFLICT(id) DO UPDATE SET username=$1,password_hash=$2,salt=$3,updated_at=NOW()`,[username,hash,salt]);}
export function createSessionCookie(){const expires=Math.floor(Date.now()/1000)+MAX_AGE;return `${COOKIE_NAME}=${expires}.${sign(String(expires))}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${MAX_AGE}`;}
export function clearSessionCookie(){return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;}
export function isAdminRequest(request:Request){const raw=request.headers.get("cookie")?.split(";").map(v=>v.trim()).find(v=>v.startsWith(`${COOKIE_NAME}=`))?.slice(COOKIE_NAME.length+1);if(!raw)return false;const [expires,signature]=raw.split(".");if(!expires||!signature||Number(expires)<=Date.now()/1000)return false;return equal(signature,sign(expires));}
