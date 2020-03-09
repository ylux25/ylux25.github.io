console.log("js!");


var isRandShiftPos = false;
var isRandLensAmount = false;
var lensParams = {
  radius: 200,
  magAmount: 20,
  magAddition: 2
};

var baseTextSize = 8;
var border = 80;

var fontForChar = 'Arial';
var fontForSpecialChar = 'Arial Black';
var centersText = ['WEB WEB WEB' ];
var textForRandomChars = [
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ[];.,!'
];

var charsArr = [];
var gridSurf;

function setup() {
  createCanvas(1000, 1000);
  translate((windowWidth - width) / 2, (windowHeight - height) / 2);
  initSetupsForCharsGrid(20, 20, centersText[0], textForRandomChars[0]);
}

function draw() {
  background(238);
  lensParams.magAmount = (lensParams.magAmount + lensParams.magAddition) / 2;

  charsArr.forEach(function(charNodeItem){ charNodeItem.calcNewPos().drawLine(); });
  charsArr.forEach(function(charNodeItem){ charNodeItem.drawChar(); });
}


function initSetupsForCharsGrid(rowCount, colCount, centerText, strForRandomChars) {
  rowCount = ~~rowCount;
  colCount = ~~colCount;
  charsArr.length = 0;
  centerText = centerText.split('');

  // for properly colCount size for centering text in horizontal position
  if (colCount != centerText.length && (colCount - centerText.length) % 2 != 0) {
    ++colCount;
  }
  if (colCount < centerText.length) {
    colCount = centerText.length;
  }

  // for properly rowCount size for centering text in vertical position
  if (rowCount % 2 == 0) {
    ++rowCount;
  }

  if (!gridSurf) {
    gridSurf = new GridCorners(new Point(border, border), new Point(width - border, height - border), colCount, rowCount);
  } else {
    gridSurf.reset(new Point(border, border), new Point(width - border, height - border), colCount, rowCount);
  }

  // for visually centering text in chars rect
  var posForCenterText = ~~((gridSurf.rowCount - 1) / 2) * gridSurf.colCount - 1 + ~~((gridSurf.colCount -centerText.length) / 2);

  gridSurf.traverse(function(x, y, index){
    if (index > posForCenterText && centerText.length) {
      charsArr.push(new CharNode( x + (isRandShiftPos ? random(-5, 5) : 0), y + (isRandShiftPos ? random(-5, 5) : 0), centerText.shift(), baseTextSize + 3, fontForSpecialChar));
      charsArr[index].clr = '#210';
      charsArr[index].lensRadius = isRandLensAmount ? random(30, 120) : lensParams.radius;
    } else {
      charsArr.push(new CharNode(x + (isRandShiftPos ? random(-5, 5) : 0), y + (isRandShiftPos ? random(-5, 5) : 0), randomChar(strForRandomChars), baseTextSize, fontForChar));
      charsArr[index].lensRadius = isRandLensAmount ? random(20, 80) : lensParams.radius;
    }
  });
}


// Point Class
function Point(x, y) {
  this.x = x;
  this.y = y;
}
Point.prototype.reset = function (x, y) {
  this.constructor(x, y);
};

function randomChar(str) {
  var chars = str || "ABCDEFGHIJKLMNOPQRSTUVWXTZ";
  var rnum = Math.floor(Math.random() * chars.length);
  return chars.substring(rnum,rnum+1);
}
// CharNode Class
function CharNode (x, y, char, size, font, clr) {
  this.initPos = new Point(x, y);
  this.currPos = new Point(x, y);
  this.char = char || randomChar();
  this.baseSize = size || 10;
  this.size = this.baseSize;
  this.distFromInitPos = 0;
  this.lensMag = 0;
  this.isBold = false;
  this.fontName = font || 'Arial';
  this.clr = clr || '#000';
  this.lensRadius = 80;
  this.isDrawEmptyChar = false;
}

CharNode.prototype.calcNewPos = function(lensDisposition) {
  var distX = mouseX - this.initPos.x;
  var distY = mouseY - this.initPos.y;

  // distance to mouse
  this.distFromInitPos = Math.sqrt(distX * distX + distY * distY);
  this.lensMag = 0;

  if (this.distFromInitPos >= this.lensRadius) {
    // char outside of 'sphere'
    this.currPos.x = this.initPos.x;
    this.currPos.y = this.initPos.y;
  } else {
    // char inside of 'sphere'
    var lensDisp = 1 + Math.cos(Math.PI * Math.abs(this.distFromInitPos / this.lensRadius));
    this.currPos.x = this.initPos.x - lensParams.magAmount * 10 * lensDisp + noise(100);
    //this.currPos.y = this.initPos.y - lensParams.magAmount * distY * lensDisp / 2;
    // this.currPos.x = this.initPos.x - distX * lensDisp; this.currPos.y = this.initPos.y - distY * lensDisp;

    this.lensMag = lensParams.magAmount * (1 - Math.sin(Math.PI * Math.abs(this.distFromInitPos / this.lensRadius) / 2));
  }

  this.size = this.baseSize * (this.lensMag + 1);

  return this;
};

CharNode.prototype.setPos = function(x, y) {
  this.initPos.reset(x, y);

  return this;
};

CharNode.prototype.drawLine = function() {
  if (!(this.char == ' ' && !this.isDrawEmptyChar)) {
    if (this.distFromInitPos <= this.lensRadius) {
      var lineOpacity = map(this.distFromInitPos, 0, this.lensRadius, 200, 0);

      push();
      stroke(180, lineOpacity);
      //line(this.initPos.x, this.initPos.y, this.currPos.x, this.currPos.y);
      pop();
    }
  }

  return this;
};

CharNode.prototype.drawChar = function () {
  if (!(this.char == ' ' && !this.isDrawEmptyChar)) {
    push();
    textAlign(CENTER, CENTER);
    fill(this.clr);
    textFont(this.fontName, this.size);
    text(this.char, this.currPos.x, this.currPos.y);
    pop();
  }

  return this;
};
// GridCorners Class
/**
 *
 * @param startPoint - left top point
 * @param endPoint - right bottom point
 * @param rowCount - count of grid point on row
 * @param colCount - count of grid point on column
 * @returns {{startPoint: Point, endPoint: Point, charsByRow: number, charsByCol: number, xStep: number, yStep: number}}
 */
function GridCorners(startPoint, endPoint, colCount, rowCount){
  this.startPoint = startPoint;
  this.endPoint = endPoint;
  this.rowCount = parseInt(rowCount);
  this.colCount = parseInt(colCount);
  this.width = Math.abs(this.endPoint.x - this.startPoint.x);
  this.height = Math.abs(this.endPoint.y - this.startPoint.y);
  this.colStep = (this.width  / (this.colCount - 1)) || .00001;
  this.rowStep = (this.height / (this.rowCount - 1)) || .00001;
}

GridCorners.prototype.reset = function(startPoint, endPoint, rowCount, colCount) {
  this.constructor(startPoint, endPoint, rowCount, colCount);

  return this;
};

GridCorners.prototype.traverse = function (inFuncToExec) {
  for (var rowPos = 0; rowPos < this.rowCount; ++rowPos) {
    for (var colPos = 0; colPos < this.colCount; ++colPos) {
      var index = rowPos * this.colCount + colPos;
      inFuncToExec(colPos * this.colStep + this.startPoint.x, rowPos * this.rowStep + this.startPoint.y, index);
    }
  }

  return this;
};

GridCorners.prototype.drawBorder = function(color) {
  push();
  stroke(color || 0);
  noFill();
  rect(gridSurf.startPoint.x, gridSurf.startPoint.y, gridSurf.width, gridSurf.height);
  pop();

  return this;
};
