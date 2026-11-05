'use strict';
(() => {
const CFG = window.KREOL_CONFIG;
const sb = window.supabase.createClient(CFG.url, CFG.anonKey, { auth: { persistSession: true, detectSessionInUrl: true, flowType: 'pkce' } });
const $ = (s, r = document) => r.querySelector(s);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const main = $('#main');
const SEL = 'id,headword,status,data';

// ---------- i18n
const T = {
 fr: { cta:'📱 Obtenir l’app', openApp:'Ouvrir dans l’app', 'nav.browse':'Parcourir','nav.fav':'Favoris','nav.submit':'Contribuer','nav.app':'Application','nav.admin':'Admin','nav.about':'À propos','nav.lektir':'Lektir',
  foot:'Diksioner Kreol Morisien — dictionnaire communautaire', title:'Diksioner Kreol Morisien', tag:'Le dictionnaire créole mauricien ↔ français ↔ anglais',
  ph:'Chercher un mot en kreol, français ou anglais…', wotd:'Mot du jour', stats:'Le dictionnaire', words:'mots', stories:'histoires',
  noRes:'Aucun résultat. Proposez ce mot !', browse:'Parcourir de A à Z', prev:'← Précédent', next:'Suivant →', favs:'Mes favoris',
  noFav:'Aucun favori pour l’instant. Touchez ☆ sur une page de mot.', review:'À vérifier', verified:'Vérifié', ety:'Étymologie',
  ex:'Exemples', variants:'Variantes', related:'Mots liés', source:'Source', suggest:'Proposer une correction', submit:'Proposer un mot ou une correction',
  kind:'Type', k_new:'Nouveau mot', k_cor:'Correction', k_ex:'Exemple', hw:'Mot (kreol)', entry:'Mot existant (identifiant)', pos:'Nature',
  dfr:'Définition (français)', den:'Définition (anglais)', exk:'Exemple en kreol', notes:'Notes', contact:'Contact (facultatif)', send:'Envoyer',
  sent:'Merci ! Votre proposition attend la validation d’un modérateur.', modq:'Toute proposition est vérifiée par un modérateur avant publication.',
  app:'Télécharger l’application Android', appTxt:'Hors ligne, audio, histoires Zistwar et synchronisation automatique.', dl:'Télécharger l’APK',
  ver:'Version', size:'Taille', login:'Connexion modérateur', email:'E-mail', pwd:'Mot de passe', signin:'Se connecter', magic:'Recevoir un lien par e-mail',
  logout:'Déconnexion', notMod:'Ce compte n’a pas le rôle modérateur.', queue:'File de modération', approve:'Approuver', reject:'Rejeter', empty:'File vide 🎉',
  linkSent:'Lien envoyé, vérifiez votre boîte mail.', needLogin:'Les propositions anonymes ne sont pas encore activées : connectez-vous par e-mail pour contribuer.',
  about:'À propos', aboutTxt:'Dictionnaire communautaire du kreol morisien. Données : Wiktionary (CC BY-SA 4.0) et contributions vérifiées. Les entrées « À vérifier » ont des définitions provisoires.' },
 en: { cta:'📱 Get the app', openApp:'Open in app', 'nav.browse':'Browse','nav.fav':'Favorites','nav.submit':'Contribute','nav.app':'App','nav.admin':'Admin','nav.about':'About','nav.lektir':'Lektir',
  foot:'Diksioner Kreol Morisien — community dictionary', title:'Diksioner Kreol Morisien', tag:'The Mauritian Creole ↔ French ↔ English dictionary',
  ph:'Search a word in Kreol, French or English…', wotd:'Word of the day', stats:'The dictionary', words:'words', stories:'stories',
  noRes:'No results. Suggest this word!', browse:'Browse A to Z', prev:'← Previous', next:'Next →', favs:'My favorites',
  noFav:'No favorites yet. Tap ☆ on a word page.', review:'Needs review', verified:'Verified', ety:'Etymology',
  ex:'Examples', variants:'Variants', related:'Related', source:'Source', suggest:'Suggest a correction', submit:'Suggest a word or correction',
  kind:'Type', k_new:'New word', k_cor:'Correction', k_ex:'Example', hw:'Word (Kreol)', entry:'Existing word (id)', pos:'Part of speech',
  dfr:'Definition (French)', den:'Definition (English)', exk:'Example in Kreol', notes:'Notes', contact:'Contact (optional)', send:'Send',
  sent:'Thank you! Your suggestion is waiting for a moderator.', modq:'Every suggestion is checked by a moderator before it goes live.',
  app:'Get the Android app', appTxt:'Offline, audio, Zistwar stories and automatic sync.', dl:'Download APK',
  ver:'Version', size:'Size', login:'Moderator sign-in', email:'Email', pwd:'Password', signin:'Sign in', magic:'Email me a sign-in link',
  logout:'Sign out', notMod:'This account does not have the moderator role.', queue:'Moderation queue', approve:'Approve', reject:'Reject', empty:'Queue is empty 🎉',
  linkSent:'Link sent, check your inbox.', needLogin:'Anonymous suggestions are not enabled yet: sign in by email to contribute.',
  about:'About', aboutTxt:'Community dictionary of Mauritian Creole. Data: Wiktionary (CC BY-SA 4.0) and reviewed contributions. “Needs review” entries have draft definitions.' },
 mfe: { cta:'📱 Pran aplikasion', openApp:'Ouver dan aplikasion', 'nav.browse':'Get tou','nav.fav':'Mo bann prefere','nav.submit':'Kontribie','nav.app':'Aplikasion','nav.admin':'Admin','nav.about':'Lor nou','nav.lektir':'Lektir',
  foot:'Diksioner Kreol Morisien — diksioner kominoter', title:'Diksioner Kreol Morisien', tag:'Diksioner kreol morisien ↔ franse ↔ angle',
  ph:'Rod enn mo an kreol, franse ouswa angle…', wotd:'Mo zordi', stats:'Diksioner', words:'mo', stories:'zistwar',
  noRes:'Nanye pa finn trouve. Propoz sa mo-la !', browse:'Get tou mo depi A ziska Z', prev:'← Avan', next:'Apre →', favs:'Mo bann prefere',
  noFav:'Okenn prefere ankor. Tous ☆ lor enn paz mo.', review:'Pou verifie', verified:'Verifie', ety:'Orizinn',
  ex:'Egzanp', variants:'Varyant', related:'Mo parey', source:'Sours', suggest:'Propoz enn koreksion', submit:'Propoz enn mo ouswa enn koreksion',
  kind:'Ki kalite', k_new:'Nouvo mo', k_cor:'Koreksion', k_ex:'Egzanp', hw:'Mo (kreol)', entry:'Mo ki deza ena (id)', pos:'Kalite mo',
  dfr:'Definision (franse)', den:'Definision (angle)', exk:'Egzanp an kreol', notes:'Not', contact:'Kontak (si ou anvi)', send:'Avoy',
  sent:'Mersi ! Enn moderater pou get ou proposision.', modq:'Enn moderater verifie tou proposision avan li paret.',
  app:'Sarz aplikasion Android', appTxt:'San internet, odio, zistwar ek sinkronizasion otomatik.', dl:'Sarz APK',
  ver:'Version', size:'Gran', login:'Konekte moderater', email:'Imel', pwd:'Mo-de-pas', signin:'Konekte', magic:'Avoy mwa enn lien par imel',
  logout:'Dekonekte', notMod:'Sa kont-la pa enn moderater.', queue:'Lalinn moderasion', approve:'Aksepte', reject:'Refize', empty:'Nanye pou get 🎉',
  linkSent:'Lien finn avoye, get ou imel.', needLogin:'Proposision anonim pa ankor aktive : konekte par imel pou kontribie.',
  about:'Lor nou', aboutTxt:'Diksioner kominoter kreol morisien. Done: Wiktionary (CC BY-SA 4.0) ek kontribision verifie. Bann mo « Pou verifie » ena definision provizwar.' }
};
let lang = localStorage.lang || (navigator.language || 'fr').slice(0, 2);
if (!T[lang]) lang = 'fr';
const t = k => T[lang][k] ?? T.en[k] ?? k;
function applyI18n() {
  document.documentElement.lang = lang === 'mfe' ? 'mfe' : lang;
  document.querySelectorAll('[data-i]').forEach(el => el.textContent = t(el.dataset.i));
  $('#lang').value = lang;
}
$('#lang').onchange = e => { lang = localStorage.lang = e.target.value; applyI18n(); route(); };

// ---------- theme
const setTheme = th => { document.documentElement.dataset.theme = th; localStorage.theme = th; };
setTheme(localStorage.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
$('#theme').onclick = () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');

// ---------- favorites
const favs = () => { try { return JSON.parse(localStorage.favs || '[]'); } catch { return []; } };
const toggleFav = id => { const f = favs(); const i = f.indexOf(id); i < 0 ? f.unshift(id) : f.splice(i, 1); localStorage.favs = JSON.stringify(f.slice(0, 500)); };

// ---------- data helpers
const gloss = d => (lang === 'en' ? (d.definitions_en || [])[0] || (d.definitions_fr || [])[0] : (d.definitions_fr || [])[0] || (d.definitions_en || [])[0]) || '';
const pat = s => s.replace(/[%_*,().:"\\]/g, ' ').trim();
let hasRpc = null;
async function search(q) {
  q = q.trim().slice(0, 60);
  if (!q) return [];
  if (hasRpc !== false) {
    const { data, error } = await sb.rpc('search_entries', { q, lim: 30 });
    if (!error) { hasRpc = true; return data.map(r => ({ id: r.id, headword: r.headword, pos: r.pos, g: lang === 'en' ? r.en || r.fr : r.fr || r.en, status: r.status })); }
    hasRpc = false;
  }
  const p = pat(q);
  if (!p) return [];
  const { data, error } = await sb.from('entries').select(SEL).eq('deleted', false)
    .or(`headword.ilike.${p}*,data->>definitions_fr.ilike.*${p}*,data->>definitions_en.ilike.*${p}*`).limit(60);
  if (error) throw error;
  const lq = q.toLowerCase();
  return data.sort((a, b) => (b.headword.toLowerCase() === lq) - (a.headword.toLowerCase() === lq)
      || (b.headword.toLowerCase().startsWith(lq)) - (a.headword.toLowerCase().startsWith(lq)) || a.headword.length - b.headword.length)
    .slice(0, 30).map(r => ({ id: r.id, headword: r.headword, pos: r.data.pos, g: gloss(r.data), status: r.status }));
}
let total = null;
async function count() {
  if (total) return total;
  const { count: c } = await sb.from('entries').select('id', { count: 'exact', head: true }).eq('deleted', false);
  return (total = c || 0);
}
const li = r => `<li><a href="#/w/${encodeURIComponent(r.id)}"><span class="hw">${esc(r.headword)}</span><span class="pos">${esc(r.pos || '')}</span>${r.status === 'needs_review' ? `<span class="tag warn">${t('review')}</span>` : ''}<span class="gl">${esc(r.g)}</span></a></li>`;
const skel = n => Array.from({ length: n }, () => '<div class="skel"></div>').join('');
const setMeta = (title, desc) => { document.title = title; $('meta[name=description]').content = desc; };

function openInApp(id) {
  const t0 = Date.now(); let hidden = false;
  const h = () => { if (document.hidden) hidden = true; };
  document.addEventListener('visibilitychange', h);
  location.href = 'kreolmorisien://word/' + encodeURIComponent(id);
  setTimeout(() => { document.removeEventListener('visibilitychange', h); if (!hidden && Date.now() - t0 < 4000) location.hash = '#/app'; }, 1600);
}
async function latestRelease() {
  const get = u => fetch(u, { cache: 'no-store' }).then(r => r.ok ? r.json() : null).catch(() => null);
  const ok = j => j && /^https:\/\/(cybchoqhntuhqxnpcgyv\.supabase\.co|github\.com\/mistergrandk\/kreol-website)\//.test(j.apkUrl);
  const [a, b] = await Promise.all([get(`${CFG.url}/storage/v1/object/public/releases/latest.json`), get('release.json')]);
  const c = [a, b].filter(ok).sort((x, y) => y.versionCode - x.versionCode)[0];
  if (!c) throw new Error('release unavailable');
  return c;
}
// ---------- views
async function home() {
  setMeta(t('title') + ' — ' + t('tag'), t('tag'));
  main.innerHTML = `<section class="hero"><h1>${t('title')}</h1><p>${t('tag')}</p>
   <div class="search" role="search"><input id="q" type="search" autocomplete="off" maxlength="60" placeholder="${esc(t('ph'))}" aria-label="${esc(t('ph'))}">
   <ul class="results" id="res" aria-live="polite"></ul></div><p><a class="btn lb heroapp" href="#/app">${t('cta')}</a></p></section>
   <div class="grid"><div class="card wotd" id="wotd"><h3>☀ ${t('wotd')}</h3>${skel(3)}</div>
   <div class="card" id="stats"><h3>📚 ${t('stats')}</h3>${skel(2)}</div>
   <div class="card"><h3>📱 ${t('app')}</h3><p class="muted">${t('appTxt')}</p><a class="btn" href="#/app" data-l>${t('dl')}</a></div></div>`;
  const inp = $('#q'), res = $('#res');
  const initial = new URLSearchParams(location.hash.split('?')[1] || '').get('q');
  let tm, seq = 0;
  const run = async () => {
    const my = ++seq, v = inp.value;
    if (!v.trim()) { res.innerHTML = ''; return; }
    try { const r = await search(v); if (my !== seq) return;
      res.innerHTML = r.length ? r.map(li).join('') : `<li class="muted pad">${t('noRes')} <a href="#/submit?hw=${encodeURIComponent(v)}">→</a></li>`;
    } catch (e) { res.innerHTML = `<li class="msg err">${esc(e.message)}</li>`; }
  };
  inp.oninput = () => { clearTimeout(tm); tm = setTimeout(run, 160); };
  if (initial) { inp.value = initial; run(); }
  inp.focus();
  try {
    const n = await count();
    const day = Math.floor(Date.now() / 864e5);
    const off = (day * 2654435761) % Math.max(1, n);
    const { data } = await sb.from('entries').select(SEL).eq('deleted', false).eq('status', 'verified').order('id').range(off % 3000, off % 3000);
    const w = data && data[0];
    if (w) $('#wotd').innerHTML = `<h3>☀ ${t('wotd')}</h3><div class="big">${esc(w.headword)}</div><div class="muted">${esc(w.data.ipa || '')} <i>${esc(w.data.pos || '')}</i></div><p>${esc(gloss(w.data))}</p><a href="#/w/${encodeURIComponent(w.id)}">→</a>`;
    const { count: sc } = await sb.from('stories').select('id', { count: 'exact', head: true }).eq('deleted', false);
    $('#stats').innerHTML = `<h3>📚 ${t('stats')}</h3><p class="stat">${n.toLocaleString()}</p><p class="muted">${t('words')} · ${sc || 0} ${t('stories')}</p><a href="#/browse">${t('browse')} →</a>`;
  } catch (e) { console.warn(e); }
}

async function word(id) {
  main.innerHTML = `<div class="card">${skel(6)}</div>`;
  const { data, error } = await sb.from('entries').select(SEL).eq('id', id).eq('deleted', false).maybeSingle();
  if (error || !data) { main.innerHTML = `<div class="msg err">404 — ${esc(id)}</div>`; return; }
  const d = data.data, isFav = favs().includes(id);
  setMeta(`${d.headword} — ${t('title')}`, `${d.headword}: ${(d.definitions_fr || []).join('; ')} / ${(d.definitions_en || []).join('; ')}`.slice(0, 160));
  const senses = (d.senses && d.senses.length ? d.senses : [{ pos: d.pos, definitions_fr: d.definitions_fr, definitions_en: d.definitions_en }]);
  const list = (k, a) => a && a.length ? `<h3>${t(k)}</h3><p>${a.map(x => `<a class="tag" href="#/?q=${encodeURIComponent(x)}">${esc(x)}</a>`).join(' ')}</p>` : '';
  main.innerHTML = `<article class="card word"><div class="row sb">
     <div><h1>${esc(d.headword)}</h1><span class="ipa">${esc(d.ipa || '')}</span> <span class="pos">${esc(d.pos || '')}</span>
     <span class="tag ${data.status === 'needs_review' ? 'warn' : ''}">${t(data.status === 'needs_review' ? 'review' : 'verified')}</span>
     ${(d.tags || []).map(x => `<span class="tag">${esc(x)}</span>`).join('')}</div>
     <button class="fav" id="fav" aria-pressed="${isFav}" title="${t('nav.fav')}">${isFav ? '★' : '☆'}</button></div>
     ${senses.map(s => `<div class="sense"><span class="pos">${esc(s.pos || '')}</span>
        ${(s.definitions_fr || []).length ? `<p>🇫🇷 ${esc(s.definitions_fr.join('; '))}</p>` : ''}
        ${(s.definitions_en || []).length ? `<p>🇬🇧 ${esc(s.definitions_en.join('; '))}</p>` : ''}</div>`).join('')}
     ${(d.examples || []).length ? `<h3>${t('ex')}</h3>` + d.examples.map(x => `<div class="ex"><b>${esc(x.kreol)}</b><i>${esc(lang === 'en' ? x.en || x.fr : x.fr || x.en)}</i></div>`).join('') : ''}
     ${d.etymology ? `<h3>${t('ety')}</h3><p>${esc(d.etymology)}</p>` : ''}
     ${list('variants', d.variants)}${list('related', d.related)}
     ${d.source && d.source.primary ? `<p class="muted small">${t('source')}: ${esc(d.source.primary)}</p>` : ''}
     <p class="row"><button class="btn" id="oia">📱 ${t('openApp')}</button><a class="btn alt lb" href="#/submit?entry=${encodeURIComponent(id)}">✎ ${t('suggest')}</a></p></article>`;
  $('#oia').onclick = () => openInApp(id);
  $('#fav').onclick = () => { toggleFav(id); word(id); };
  const ld = document.createElement('script'); ld.type = 'application/ld+json';
  ld.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'DefinedTerm', name: d.headword, description: gloss(d), inDefinedTermSet: 'Diksioner Kreol Morisien' });
  main.appendChild(ld);
}

async function browse(letter = 'a', page = 0) {
  setMeta(`${t('browse')} — ${t('title')}`, t('tag'));
  const L = 'abcdefghijklmnopqrstuvwxyz'.split(''), per = 60;
  main.innerHTML = `<h1>${t('browse')}</h1><div class="az">${L.map(l => `<a href="#/browse/${l}" class="${l === letter ? 'on' : ''}">${l.toUpperCase()}</a>`).join('')}</div><div class="card"><ul class="results" id="bl">${skel(8)}</ul><div class="pager" id="pg"></div></div>`;
  const { data, count: c, error } = await sb.from('entries').select(SEL, { count: 'exact' }).eq('deleted', false).ilike('headword', letter + '%').order('headword').range(page * per, page * per + per - 1);
  if (error) { $('#bl').innerHTML = `<li class="msg err">${esc(error.message)}</li>`; return; }
  $('#bl').innerHTML = data.map(r => li({ id: r.id, headword: r.headword, pos: r.data.pos, g: gloss(r.data), status: r.status })).join('');
  $('#pg').innerHTML = `${page > 0 ? `<a href="#/browse/${letter}/${page - 1}">${t('prev')}</a>` : '<span></span>'}<span class="muted">${page * per + 1}–${Math.min(c, page * per + per)} / ${c}</span>${(page + 1) * per < c ? `<a href="#/browse/${letter}/${page + 1}">${t('next')}</a>` : '<span></span>'}`;
}

async function favorites() {
  const f = favs();
  main.innerHTML = `<h1>★ ${t('favs')}</h1><div class="card"><ul class="results" id="fl">${f.length ? skel(4) : `<li class="muted">${t('noFav')}</li>`}</ul></div>`;
  if (!f.length) return;
  const { data } = await sb.from('entries').select(SEL).in('id', f.slice(0, 200)).eq('deleted', false);
  const m = new Map((data || []).map(r => [r.id, r]));
  $('#fl').innerHTML = f.filter(id => m.has(id)).map(id => { const r = m.get(id); return li({ id, headword: r.headword, pos: r.data.pos, g: gloss(r.data), status: r.status }); }).join('');
}

const clean = (s, n) => String(s || '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, n);
async function submitView() {
  const qs = new URLSearchParams(location.hash.split('?')[1] || '');
  const entry = clean(qs.get('entry'), 80), hw = clean(qs.get('hw'), 60);
  const { data: { session } } = await sb.auth.getSession();
  main.innerHTML = `<h1>${t('submit')}</h1><div class="card"><p class="muted">🛡 ${t('modq')}</p>
   <form class="f" id="sf" novalidate>
    <label>${t('kind')}</label><select name="kind"><option value="new_word">${t('k_new')}</option><option value="correction" ${entry ? 'selected' : ''}>${t('k_cor')}</option><option value="example">${t('k_ex')}</option></select>
    <div id="fe"><label>${t('entry')}</label><input name="entry" maxlength="80" pattern="[a-z0-9_]+" value="${esc(entry)}"></div>
    <label>${t('hw')}</label><input name="headword" maxlength="60" value="${esc(hw)}">
    <label>${t('pos')}</label><select name="pos"><option></option>${['noun','verb','adjective','adverb','pronoun','preposition','conjunction','interjection','phrase'].map(p => `<option>${p}</option>`).join('')}</select>
    <label>${t('dfr')}</label><textarea name="dfr" maxlength="300" rows="2"></textarea>
    <label>${t('den')}</label><textarea name="den" maxlength="300" rows="2"></textarea>
    <label>${t('exk')}</label><input name="ex" maxlength="200">
    <label>${t('notes')}</label><textarea name="notes" maxlength="500" rows="2"></textarea>
    <label>${t('contact')}</label><input name="contact" maxlength="120" autocomplete="email">
    <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
    <p><button class="btn" type="submit">${t('send')}</button></p><div id="sm"></div></form>
    ${session ? '' : `<details><summary class="muted">${t('signin')} (${t('email')})</summary><div class="row"><input id="me" type="email" placeholder="${t('email')}"><button id="mb">${t('magic')}</button></div><div id="mm"></div></details>`}</div>`;
  const f = $('#sf'), fe = $('#fe');
  const sync = () => fe.style.display = f.kind.value === 'new_word' ? 'none' : '';
  f.kind.onchange = sync; sync();
  const opened = Date.now();
  if ($('#mb')) $('#mb').onclick = () => magic($('#me').value, $('#mm'));
  f.onsubmit = async e => {
    e.preventDefault();
    const m = $('#sm'), kind = f.kind.value;
    const payload = { headword: clean(f.headword.value, 60), pos: clean(f.pos.value, 30),
      definitions_fr: clean(f.dfr.value, 300) ? [clean(f.dfr.value, 300)] : [], definitions_en: clean(f.den.value, 300) ? [clean(f.den.value, 300)] : [],
      notes: clean(f.notes.value, 500) };
    if (clean(f.ex.value, 200)) payload.examples = [{ kreol: clean(f.ex.value, 200) }];
    const err = s => m.innerHTML = `<div class="msg err">${esc(s)}</div>`;
    if (f.website.value || Date.now() - opened < 2500) return err('…');
    if (kind === 'new_word' && !payload.headword) return err(t('hw') + ' ?');
    if (kind !== 'new_word' && !/^[a-z0-9_]{1,80}$/.test(f.entry.value)) return err(t('entry') + ' ?');
    if (/(https?:\/\/|www\.|<)/i.test(JSON.stringify(payload))) return err('Links / HTML not allowed');
    const last = +localStorage.lastSub || 0;
    if (Date.now() - last < 20000) return err('⏳ 20s');
    f.querySelector('button').disabled = true;
    let { error } = await sb.rpc('submit_web', { p_kind: kind, p_entry_id: kind === 'new_word' ? null : f.entry.value, p_payload: payload, p_contact: clean(f.contact.value, 120) || null, p_hp: null });
    if (error && /function|schema cache|not find/i.test(error.message)) {
      const { data: { session: s } } = await sb.auth.getSession();
      if (!s) { f.querySelector('button').disabled = false; return err(t('needLogin')); }
      ({ error } = await sb.from('submissions').insert({ kind, entry_id: kind === 'new_word' ? null : f.entry.value, payload, client_id: 'web-' + crypto.randomUUID() }));
    }
    f.querySelector('button').disabled = false;
    if (error) return err(error.message);
    localStorage.lastSub = Date.now(); f.reset(); sync();
    m.innerHTML = `<div class="msg">✅ ${t('sent')}</div>`;
  };
}

async function magic(email, box) {
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { box.innerHTML = `<div class="msg err">${t('email')} ?</div>`; return; }
  const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: location.origin + location.pathname + '#/admin' } });
  box.innerHTML = error ? `<div class="msg err">${esc(error.message)}</div>` : `<div class="msg">${t('linkSent')}</div>`;
}

async function appView() {
  setMeta(`${t('app')} — ${t('title')}`, t('appTxt'));
  main.innerHTML = `<div class="card"><h1>📱 ${t('app')}</h1><p>${t('appTxt')}</p><div id="rel">${skel(3)}</div></div>`;
  try {
    const j = await latestRelease();
    $('#rel').innerHTML = `<p><b>${t('ver')}</b> ${esc(j.versionName)} · <b>${t('size')}</b> ${(j.size / 1048576).toFixed(1)} MB</p>
      <p class="muted">${esc(lang === 'en' ? j.notes_en : j.notes_fr)}</p>
      <a class="btn lb" href="${esc(j.apkUrl)}" rel="noopener">⬇ ${t('dl')}</a>
      <p class="muted tiny">SHA-256: ${esc(j.sha256)}</p>`;
  } catch (e) { $('#rel').innerHTML = `<div class="msg err">${esc(e.message)}</div>`; }
}

async function admin() {
  setMeta(`Admin — ${t('title')}`, '');
  const { data: { session } } = await sb.auth.getSession();
  if (!session) {
    main.innerHTML = `<div class="card narrow"><h1>🔐 ${t('login')}</h1><form class="f" id="lf">
      <label>${t('email')}</label><input name="email" type="email" required autocomplete="username">
      <label>${t('pwd')}</label><input name="pwd" type="password" autocomplete="current-password">
      <p class="row"><button class="btn">${t('signin')}</button><button type="button" id="ml">${t('magic')}</button></p><div id="lm"></div></form></div>`;
    const f = $('#lf');
    f.onsubmit = async e => { e.preventDefault();
      const { error } = await sb.auth.signInWithPassword({ email: f.email.value, password: f.pwd.value });
      if (error) $('#lm').innerHTML = `<div class="msg err">${esc(error.message)}</div>`; else admin(); };
    $('#ml').onclick = () => magic(f.email.value, $('#lm'));
    return;
  }
  const { data: prof } = await sb.from('profiles').select('role,display_name').eq('id', session.user.id).maybeSingle();
  const head = `<div class="row sb"><h1>🛡 ${t('queue')}</h1><span class="muted">${esc(session.user.email)} · ${esc(prof?.role || 'user')} <button id="lo">${t('logout')}</button></span></div>`;
  if (!prof || !['moderator', 'admin'].includes(prof.role)) { main.innerHTML = head + `<div class="msg err">${t('notMod')}</div>`; $('#lo').onclick = logout; return; }
  main.innerHTML = head + `<div class="card" id="ql">${skel(5)}</div>`; $('#lo').onclick = logout;
  const { data, error } = await sb.from('submissions').select('*').eq('status', 'pending').order('created_at').limit(100);
  if (error) { $('#ql').innerHTML = `<div class="msg err">${esc(error.message)}</div>`; return; }
  $('#ql').innerHTML = data.length ? data.map(s => `<div class="q" data-id="${esc(s.id)}"><div class="row"><span class="tag">${esc(s.kind)}</span>
     ${s.entry_id ? `<a href="#/w/${encodeURIComponent(s.entry_id)}">${esc(s.entry_id)}</a>` : ''}<span class="muted">${new Date(s.created_at).toLocaleString()} · ${esc(s.source || 'app')}</span></div>
     <pre>${esc(JSON.stringify(s.payload, null, 2))}</pre><div class="row"><input placeholder="${t('notes')}" maxlength="300" class="note">
     <button class="btn" data-a="1">${t('approve')}</button><button data-a="0">${t('reject')}</button></div></div>`).join('') : `<p>${t('empty')}</p>`;
  $('#ql').onclick = async e => {
    const b = e.target.closest('button[data-a]'); if (!b) return;
    const box = b.closest('.q'); b.disabled = true;
    const { error: er } = await sb.rpc('moderate_submission', { p_id: box.dataset.id, p_approve: b.dataset.a === '1', p_payload: null, p_note: box.querySelector('.note').value.slice(0, 300) || null });
    if (er) { b.disabled = false; alert(er.message); } else box.remove();
  };
}
async function logout() { await sb.auth.signOut(); admin(); }

function about() { main.innerHTML = `<div class="card"><h1>${t('about')}</h1><p>${t('aboutTxt')}</p></div>`; }

// ---------- Lektir (static JSON translations)
const getJ = async p => { const r = await fetch(p, { cache: 'no-cache' }); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); };
async function lektir(slug) {
  if (!slug) {
    const ix = await getJ('lektir/index.json');
    const done = ix.works.filter(w => w.slug), todo = ix.works.filter(w => !w.slug);
    main.innerHTML = `<div class="card lk"><h1>Lektir</h1><p>Bann zev ${esc(ix.author)} tradwir an Kreol Morisien.</p><p class="tag">${esc(ix.note_km)}</p>
      <h2>Disponib (${done.length}/${ix.works.length})</h2><ul class="lkl">${done.map(w => `<li><a href="#/lektir/${esc(w.slug)}"><b>${esc(w.title_km)}</b></a><br><small>${esc(w.title_fr)} · ${esc(w.year)}</small>${w.status === 'partial' ? ` <span class="tag">${esc(w.progress_km || 'Parsiel')}</span>` : ''}</li>`).join('')}</ul>
      <h2>Pe vini</h2><ul class="lkl muted">${todo.map(w => `<li>${esc(w.title_fr)} <small>· ${esc(w.year)} · ${esc(w.part)}</small></li>`).join('')}</ul></div>`;
    return;
  }
  if (!/^[a-z0-9-]+$/.test(slug)) throw new Error('?');
  const w = await getJ('lektir/' + slug + '.json');
  main.innerHTML = `<article class="card lk"><p><a href="#/lektir">← Lektir</a></p><h1>${esc(w.title_km)}</h1>
    <p><i>${esc(w.title_fr)}</i> — ${esc(w.author)}, ${esc(w.year)}</p><p class="tag">${esc(w.note_km)}</p>${w.progress_km ? `<p class="tag">${esc(w.progress_km)}</p>` : ''}${w.note_omit ? `<p><small>${esc(w.note_omit)}</small></p>` : ''}
    <nav class="lkt">${w.sections.map((x, i) => `<a href="#lk${i}" data-s="${i}">${esc(x.title_km)}</a>`).join(' · ')}</nav>
    ${w.sections.map((x, i) => `<section id="lk${i}"><h2>${esc(x.title_km)}</h2><p><small><i>${esc(x.title_fr)}</i></small></p>${x.type === 'prose' ? x.text.split(/\n\n+/).map(p => `<p>${esc(p)}</p>`).join('') : `<div class="verse">${x.text.split(/\n\n+/).map(st => `<p>${esc(st).replace(/\n/g, '<br>')}</p>`).join('')}</div>`}</section>`).join('')}
    <p><small>${esc(w.source)}</small></p></article>`;
  main.querySelectorAll('.lkt a').forEach(a => a.onclick = e => { e.preventDefault(); $('#lk' + a.dataset.s).scrollIntoView({ behavior: 'smooth' }); });
}

// ---------- router
async function route() {
  const h = location.hash.replace(/^#\/?/, '').split('?')[0];
  const [a, b, c] = h.split('/').map(decodeURIComponent);
  document.querySelectorAll('nav a').forEach(x => x.classList.toggle('on', x.getAttribute('href') === '#/' + (a || '')));
  try {
    if (a === 'w' && b) await word(b);
    else if (a === 'browse') await browse(/^[a-z]$/.test(b) ? b : 'a', Math.max(0, parseInt(c) || 0));
    else if (a === 'favorites') await favorites();
    else if (a === 'submit') await submitView();
    else if (a === 'app') await appView();
    else if (a === 'admin') await admin();
    else if (a === 'about') about();
    else if (a === 'lektir') await lektir(b);
    else await home();
  } catch (e) { main.innerHTML = `<div class="msg err">${esc(e.message || e)}</div>`; }
  window.scrollTo(0, 0);
}
// support ?w=id deep links (sitemap)
const w0 = new URLSearchParams(location.search).get('w');
if (w0 && !location.hash) location.hash = '#/w/' + encodeURIComponent(w0);
addEventListener('hashchange', route);
applyI18n(); route();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
