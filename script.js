const body=document.body, theme=document.getElementById("theme"), menu=document.querySelector(".menu"), links=document.querySelector(".links");
if(localStorage.theme==="light") body.classList.add("light");
function icon(){theme.textContent=body.classList.contains("light")?"☾":"☀"} icon();
theme.onclick=()=>{body.classList.toggle("light");localStorage.theme=body.classList.contains("light")?"light":"dark";icon()};
menu.onclick=()=>links.classList.toggle("open");
document.querySelectorAll(".links a").forEach(a=>a.onclick=()=>links.classList.remove("open"));
document.getElementById("year").textContent=new Date().getFullYear();
