let particleSize = "20vmin";
let animationDuration = "6s";
let amount = 20;
const background = document.getElementById("background");

for(let i = 0; i < amount; i++){
    const span = document.createElement("span");
    background.appendChild(span);
}

const spans = document.querySelectorAll("#background span");
const colors = [
    "#583C87",
    "#E45A84",
    "#FFACAC"
    ];
  for( let span of spans){
    let style = span.style; 
    style.color = colors[Math.floor(Math.random()*3)];
    style.top = Math.random()*100+"%";
    style.left = Math.random()*100+"%";
    style.animationDuration = 10 + Math.random()*animationDuration + "s";
    style.animationDelay = -1 + Math.random()*animationDuration + "s";
    style.transformOrigin = (Math.random()*50-25+"vw") + " " + (Math.random()*50-25+"vh");
    const blurRadius = (Math.random()+0.5) * Number.parseInt(particleSize) * 0.5 + "vmin";
    const x = Math.random()>0.5 ? -1 : 1;
    style.boxShadow = (Number.parseInt(particleSize) * 2 * x) + "vmin 0 " + blurRadius + " currentColor";  
}