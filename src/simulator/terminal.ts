export interface TerminalState{cwd:string;files:Record<string,string>;history:string[]}
export interface TerminalResult{state:TerminalState;output:string}
export const initialTerminalState=():TerminalState=>({cwd:'/home/rookie',files:{'/home/rookie/README.txt':'Добро пожаловать в BESIT. Это симулятор, не полноценный Linux.','/home/rookie/notes.txt':'Цель смены: изучить окружение и проверить сервис.','/var/log/app.log':'INFO service starting\nWARN config file missing\nERROR cannot read /etc/besit/app.conf','/etc/besit/app.conf':'PORT=8080\nMODE=training'},history:[]});
const normalize=(path:string,cwd:string)=>{const out:string[]=[];for(const part of (path.startsWith('/')?path:`${cwd}/${path}`).split('/')){if(!part||part==='.')continue;if(part==='..')out.pop();else out.push(part);}return'/'+out.join('/');};
export function runCommand(state:TerminalState,input:string):TerminalResult{
 const line=input.trim();if(!line)return{state,output:''};const history=[...state.history,line].slice(-100);const [cmd,...args]=line.split(/\s+/);const next={...state,history};
 const children=(dir:string)=>[...new Set(Object.keys(state.files).filter(p=>p.startsWith(dir==='/'?'/':dir+'/')).map(p=>p.slice(dir==='/'?0:dir.length+1).split('/')[0]))].sort();
 switch(cmd){
 case'help':return{state:next,output:'Команды: help, pwd, ls, cd, cat, whoami, echo, clear. Ограниченный симулятор; системная оболочка не запускается.'};
 case'pwd':return{state:next,output:state.cwd};case'whoami':return{state:next,output:'rookie'};
 case'ls':{const p=normalize(args.find(a=>!a.startsWith('-'))??'.',state.cwd);const names=children(p);return{state:next,output:names.length?names.join('  '):(state.files[p]!==undefined?p.split('/').pop()??'/':'Нет такого каталога или он пуст.')}} 
 case'cd':{const p=normalize(args[0]??'/home/rookie',state.cwd);const dir=p==='/'||Object.keys(state.files).some(f=>f.startsWith(p+'/'));return dir?{state:{...next,cwd:p},output:''}:{state:next,output:`cd: каталог не найден: ${p}`};}
 case'cat':{if(!args[0])return{state:next,output:'Использование: cat <файл>'};const p=normalize(args[0],state.cwd);return{state:next,output:state.files[p]??`cat: файл не найден: ${p}`};}
 case'echo':return{state:next,output:args.join(' ')};case'clear':return{state:{...next,history:[]},output:'\u0000CLEAR'};
 default:return{state:next,output:`Команда «${cmd}» не поддерживается. Ничего не выполнялось в вашей ОС.`};
 }
}
