import type { GameEvent, PlayerProfile, SaveFile } from './types';
import { SAVE_KEY } from './game';
function strings(v:unknown):v is string[]{return Array.isArray(v)&&v.every(x=>typeof x==='string');}
export function isSaveFile(v:unknown):v is SaveFile{
 if(!v||typeof v!=='object')return false;const x=v as Partial<SaveFile>;if(x.schemaVersion!==1||!x.profile||typeof x.profile!=='object'||!Array.isArray(x.events))return false;
 const p=x.profile as Partial<PlayerProfile>;
 return typeof p.callsign==='string'&&p.callsign.length<=24&&Number.isInteger(p.level)&&(p.level??0)>=1&&Number.isInteger(p.xp)&&(p.xp??-1)>=0&&strings(p.completedMissionIds)&&strings(p.unlockedCompetencies)&&strings(p.achievementIds)&&strings(p.favoriteMissionIds)&&typeof p.updatedAt==='string'&&x.events.every(e=>!!e&&typeof e==='object'&&typeof(e as GameEvent).id==='string'&&typeof(e as GameEvent).message==='string');
}
export function exportSave(profile:PlayerProfile,events:GameEvent[]):string{return JSON.stringify({schemaVersion:1,exportedAt:new Date().toISOString(),profile,events} satisfies SaveFile,null,2);}
export function importSave(raw:string):{ok:true;save:SaveFile}|{ok:false;message:string}{
 try{if(raw.length>1_000_000)return{ok:false,message:'Файл слишком большой (максимум 1 МБ).'};const parsed:unknown=JSON.parse(raw);return isSaveFile(parsed)?{ok:true,save:parsed}:{ok:false,message:'Формат сохранения не распознан. Текущий прогресс не изменён.'};}
 catch{return{ok:false,message:'Не удалось прочитать JSON. Текущий прогресс не изменён.'};}
}
export function persistSave(profile:PlayerProfile,events:GameEvent[]){try{if(typeof localStorage==='undefined')return{ok:false,message:'Хранилище браузера недоступно.'};localStorage.setItem(SAVE_KEY,exportSave(profile,events));return{ok:true,message:'Прогресс сохранён локально.'};}catch{return{ok:false,message:'Браузер не смог сохранить данные. Экспортируй сохранение в файл.'};}}
export function readSave():{profile:PlayerProfile;events:GameEvent[]}|null{try{const raw=localStorage.getItem(SAVE_KEY);if(!raw)return null;const p:unknown=JSON.parse(raw);return isSaveFile(p)?{profile:p.profile,events:p.events}:null;}catch{return null;}}
