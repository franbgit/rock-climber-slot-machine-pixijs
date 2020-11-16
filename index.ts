//Aliases
const pApplication = PIXI.Application,
    pLoader = PIXI.loader,
    pResources = PIXI.loader.resources,
    pSprite = PIXI.Sprite,
    pTextureCache = PIXI.utils.TextureCache,
    pGraphics = PIXI.Graphics,
    pText = PIXI.Text,
    pContainer = PIXI.Container,
    pTextStyle = PIXI.TextStyle;

//Create a Pixi Application
const app = new pApplication({
  width: 1280,
  height: 800,
  antialias: true,
  transparent: false,
  resolution: 1
});
  
//Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);

const icons = [
  "images/icon_1.png",
  "images/icon_2.png",
  "images/icon_3.png",
  "images/icon_4.png",
  "images/icon_5.png",
  "images/icon_6.png",
  "images/icon_7.png",
  "images/icon_8.png",
];

// Load an image and run the `setup` function when it's done
pLoader
  .add("images/back.png")
  .add("images/frame.png")
  .add(icons)
  .add("images/logo_small.png")
  .add("images/pers_static.png")
  .add("images/start_btn.png")
  .add("images/start_active_btn.png")
  .on("progress", loadProgressHandler)
  .load(setup);

// Positions in axes x/y in the background
const xSlotPositions = [220, 390, 560, 730, 900];
const ySlotPositions = [110, 260, 410];

// Predefined reels
let predefinedReels = [
  {index: 3, slots: [1, 6, 1]},
  {index: 3, slots: [2, 6, 2]},
  {index: 3, slots: [3, 6, 3]},
  {index: 3, slots: [4, 6, 4]},
  {index: 3, slots: [5, 6, 5]},
];

let reels: Array<{
  slots: Array<{
    lastIndex: number,
    icons: Array<PIXI.Sprite>
  }>,
  frame: PIXI.Sprite
}> = [];

let enableReels = [false, false, false, false, false];

let enableUpdate = true;
let stopCountdown = 0;

let startBtn: PIXI.Sprite, stopBtn: PIXI.Container;
let state: (delta: any) => void;

function loadProgressHandler(loader: any, resource: any) {
  // Display the percentage of files currently loaded
  console.log("progress: " + loader.progress + "%"); 
}

// This `setup` function will run when the images have loaded
// Create the sprites and add the sprites to the stage
function setup() {
  // Sprites
  const logo = getSprite("images/logo_small.png", 415, -20, true);
  const person = getSprite("images/pers_static.png", 1025, 200, true);
  const back = getSprite("images/back.png", 0, 0, true);
  const ingameBtn = getSprite('images/start_active_btn.png', 1100, 650, true);

  // Button sprites
  startBtn = getButton('images/start_btn.png', 1100, 650, true, startGame);
  stopBtn = getStopButton(560, 575, false, stopGame);

  // Add background to the stage
  app.stage.addChild(back);

  // Add slots, frames to the stage
  const slotList = icons.concat(icons);
  const slotListLength = slotList.length;
  for (let i = 0; i < 5; i++) {
    const frame = getSprite("images/frame.png", xSlotPositions[i] - 15, ySlotPositions[1] - 15, false);
    let reel: {slots: Array<{lastIndex: number, icons: Array<PIXI.Sprite>}>, frame: PIXI.Sprite} = {
      slots: [],
      frame: frame,
    };
    for (let j = 0; j < 3; j++) {
      let slot: {lastIndex: number, icons: Array<PIXI.Sprite>} = {
        lastIndex: Math.floor(Math.random() * (icons.length)),
        icons: []
      };
      for (let k = 0; k < slotListLength; k++) {
        const icon = getSprite(slotList[k], xSlotPositions[i], ySlotPositions[j], k === 0);
        app.stage.addChild(icon);
        slot.icons.push(icon);
      }
      reel.slots.push(slot);
    }
    app.stage.addChild(reel.frame);
    reels.push(reel);
  }

  // Adding the rest of the sprites to the stage
  app.stage.addChild(logo);
  app.stage.addChild(person);
  app.stage.addChild(ingameBtn);
  app.stage.addChild(startBtn);
  app.stage.addChild(stopBtn);

  // Init stage
  updateSlotPositions([true, true, true, true, true]);

  //set the game state to `play`
  state = play;

  //Start the game loop by adding the `gameLoop` function to
  //Pixi's `ticker` and providing it with a `delta` argument.
  app.ticker.add(delta => gameLoop(delta));
}

//Runs the current game `state` in a loop and renders the sprites
function gameLoop(delta: any) {
  //Update the current game state:
  state(delta);
}

function play(delta: any) {
  if (enableUpdate) {
    updateSlotPositions(enableReels);

    setTimeout(function () {
      enableUpdate = true;
    }, 20);
    enableUpdate = false;
  }
}

function getSprite(url: string | number, x: number, y: number, visible: boolean) {
  let sprite = new pSprite(pTextureCache[url]);
  sprite.position.set(x, y);
  sprite.visible = visible;

  return sprite;
}

function getButton(url: string | number, x: number, y: number, visible: boolean, action: () => void) {
  let button = getSprite(url, x, y, visible);
  button = getInteractiveButton(button, action) as PIXI.Sprite;

  return button;
}

function getStopButton(x: number, y: number, visible: boolean, action: () => void) {
  let circle  = new pGraphics();
  circle.beginFill(0xff0000);
  circle.lineStyle(5, 0x000000); // set the line style to have a width of 5 and set the color to red
  circle.drawCircle(72, 72, 72);
  circle.endFill();
  circle = getInteractiveButton(circle, action) as PIXI.Graphics;

  let style = new pTextStyle({
    fontFamily: "Arial",
    fontSize: 36,
    fill: "white",
    stroke: '#ff3300',
    strokeThickness: 4,
    dropShadow: true,
    dropShadowColor: "#000000",
    dropShadowBlur: 4,
    dropShadowAngle: Math.PI / 6,
    dropShadowDistance: 6,
    align : 'center',
    fontWeight: 'bold'
  });

  let txt = new pText('STOP', style);
  txt.position.set(20, 50);

  let stopBtn = new pContainer();
  stopBtn.addChild(circle);
  stopBtn.addChild(txt);
  stopBtn.position.set(x, y);
  stopBtn.visible = visible;

  return stopBtn;
}

// Make the button interactive
function getInteractiveButton(button: PIXI.Sprite | PIXI.Graphics, action: () => void) {
  button.interactive = true;
  button.buttonMode = true;
  button.on('pointerdown', action);

  return button;
}

function startGame() {
  startBtn.visible = false;
  stopBtn.visible = true;
  enableReels = [true, true, true, true, true];
  for (let i = 0; i < predefinedReels.length; i++) {
    predefinedReels[i].index = 0;
  }
  for (let i = 0; i < reels.length; i++) {
    reels[i].frame.visible = false;
  }
}

function stopGame() {
  if (stopCountdown < 5) {
    setTimeout(function () {
      enableReels[stopCountdown] = false;
      stopCountdown++;
      stopGame();
    }, 2000);
  } else {
    stopCountdown = 0;
  }
}

// Select a icon ramdomly and move the position of the other one step below
function updateSlotPositions(enableReels: boolean[]) {
  for (let i = 0; i < reels.length; i++) {
    let top = reels[i].slots[0];
    let middle = reels[i].slots[1];
    let bottom = reels[i].slots[2];
    if (enableReels[i]) {
      bottom = setSlot(bottom, middle.lastIndex);
      middle = setSlot(middle, top.lastIndex);
      top = setSlot(top, Math.floor(Math.random() * (icons.length)));

    } else {
      if (predefinedReels[i].index < 3) {
        bottom = setSlot(bottom, middle.lastIndex);
        middle = setSlot(middle, top.lastIndex);
        top = setSlot(top, predefinedReels[i].slots[predefinedReels[i].index]);

        if(++predefinedReels[i].index > 2) {
          reels[i].frame.visible = true;
          if (i === (reels.length - 1)) {
            stopBtn.visible = false;
            startBtn.visible = true;
          }
        };
      }
    }
  }
}

function setSlot(slot1: {lastIndex: number, icons: Array<PIXI.Sprite>}, newIndex: number) {
  if (slot1.lastIndex !== newIndex) { // if so, move slot1 to the newIndex
    slot1.icons[newIndex].visible = true; // Turn the current slot1 into visible
    slot1.icons[slot1.lastIndex].visible = false; // Turn the previous slot1 into invisible
    slot1.lastIndex = newIndex; // Update slot1 index
  }
  return slot1;
}
