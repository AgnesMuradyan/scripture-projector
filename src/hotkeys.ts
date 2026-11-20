export const HOTKEYS = [
 ['Enter','Present the prepared passage'],['← / →','Previous / next live slide'],['↑ / ↓','Prepare previous / next verse'],['[ / ]','Previous / next chapter'],['F or /','Focus Scripture search'],['Q','Add prepared passage to queue'],['H','Show presentation history'],['T','Show presentation queue'],['B','Blackout'],['G','Show default photo'],['R','Restore live passage'],['Esc','Show default photo / close dialog'],['?','Show keyboard shortcuts']
];
export type HotkeyAction='present'|'previous'|'next'|'verse-previous'|'verse-next'|'chapter-previous'|'chapter-next'|'search'|'queue-add'|'history'|'queue'|'blackout'|'background'|'restore'|'escape'|'help';
export function hotkeyAction(e:Pick<KeyboardEvent,'key'|'code'|'altKey'|'ctrlKey'|'metaKey'|'shiftKey'|'repeat'|'isComposing'>,typing:boolean):HotkeyAction|null{
 if(e.repeat||e.isComposing||e.altKey||e.ctrlKey||e.metaKey)return null;
 if(e.key==='Escape')return 'escape';
 if(typing)return null;
 if(e.key==='?'||(e.code==='Slash'&&e.shiftKey))return 'help';
 if(e.shiftKey)return null;
 const keys:Record<string,HotkeyAction>={Enter:'present',ArrowLeft:'previous',ArrowRight:'next',ArrowUp:'verse-previous',ArrowDown:'verse-next',BracketLeft:'chapter-previous',BracketRight:'chapter-next',KeyF:'search',Slash:'search',KeyQ:'queue-add',KeyH:'history',KeyT:'queue',KeyB:'blackout',KeyG:'background',KeyR:'restore'};
 return keys[e.code]??keys[e.key]??null;
}
