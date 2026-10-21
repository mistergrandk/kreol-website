from playwright.sync_api import sync_playwright
B='https://mistergrandk.github.io/kreol-website/'
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome')
    errs=[]
    pg=b.new_page(viewport={'width':1280,'height':900})
    pg.on('console',lambda m: m.type=='error' and errs.append(m.text))
    pg.goto(B); pg.wait_for_selector('#wotd .big',timeout=20000)
    pg.fill('#q','lapli'); pg.wait_for_selector('#res li a',timeout=15000)
    print('results:',pg.inner_text('#res')[:200].replace('\n',' | '))
    pg.screenshot(path='screens/1-home-search.png')
    pg.goto(B+'#/w/lapli'); pg.wait_for_selector('.word h1'); pg.click('#fav'); pg.wait_for_timeout(1500)
    pg.screenshot(path='screens/2-word-page.png',full_page=True)
    m=b.new_page(viewport={'width':390,'height':844},color_scheme='dark')
    m.goto(B+'#/browse/k'); m.wait_for_selector('#bl li a'); m.evaluate("document.getElementById('lang').value='mfe';document.getElementById('lang').dispatchEvent(new Event('change'))"); m.wait_for_selector('#bl li a')
    m.screenshot(path='screens/3-browse-mobile-dark-kreol.png')
    m.goto(B+'#/app'); m.wait_for_selector('#rel a.btn',timeout=15000); print('app ok')
    m.goto(B+'#/submit'); m.wait_for_timeout(3000); m.fill('input[name=headword]','testmo'); m.click('#sf button'); m.wait_for_selector('#sm .msg'); print('submit:',m.inner_text('#sm'))
    m.goto(B+'#/admin'); m.wait_for_selector('#lf'); print('admin login ok')
    print('console errors:',errs)
    b.close()
