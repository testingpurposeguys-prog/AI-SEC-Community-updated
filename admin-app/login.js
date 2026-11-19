(function(){
  var KEY='decap-cms-user', btn=document.getElementById('go'), err=document.getElementById('err');
  try{var u=JSON.parse(localStorage.getItem(KEY)||'null'); if(u&&u.token){location.replace('cms/');return;}}catch(e){}
  btn.addEventListener('click',function(){
    err.textContent=''; btn.disabled=true;
    var w=window.open('api/auth','github-login','width=600,height=700');
    if(!w){err.textContent='Popup blocked. Allow popups for this page and try again.';btn.disabled=false;return;}
    function onMsg(e){
      if(e.origin!==location.origin) return;
      if(e.data==='authorizing:github'){e.source.postMessage('authorizing:github',e.origin);return;}
      var m=/^authorization:github:(success|error):([\s\S]*)$/.exec(e.data); if(!m) return;
      window.removeEventListener('message',onMsg); btn.disabled=false;
      if(m[1]==='success'){
        try{var d=JSON.parse(m[2]); if(!d||typeof d.token!=='string'||!d.token) throw 0; localStorage.setItem(KEY,JSON.stringify({token:d.token,backendName:'github'})); location.href='cms/';}
        catch(x){err.textContent='Login failed. Try again.';}
      } else err.textContent='GitHub login failed. Try again.';
    }
    window.addEventListener('message',onMsg);
  });
})();
