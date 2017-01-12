;
(function(win, doc) {
  win.onload = function() {



    function usersCanvas(r, c, userRects, canvas) {
      this.rows = r;
      this.columns = c;
      this.userRects = userRects;
      this.cxt = canvas.getContext('2d');
      this.canvas = canvas;
      this.isbegin = false;
    }
    usersCanvas.prototype.draw = function() {
    console.log(1)
      var self = this;
      var cxt = self.cxt;
      cxt.clearRect(0, 0, self.canvas.width, self.canvas.height);
      for (var i = 0; i < self.rows; i++) {
        for (var j = 0; j < self.columns; j++) {
          (function(x, y) {
            var userRect = self.userRects[x * self.columns + y];
            if (userRect) {
              var spritesheet = new Image();
              spritesheet.src = userRect.sprite;
              spritesheet.onload = function() {
                cxt.drawImage(spritesheet, y * userRect.size, x * userRect.size, userRect.size, userRect.size);
                if (self.isbegin && userRect.selected) {
                  cxt.beginPath();
                  cxt.rect(y * userRect.size, x * userRect.size, userRect.size, userRect.size);
                  cxt.stroke();
                  cxt.closePath();
                }
                if (!self.isbegin && userRect.selected) {
                  cxt.beginPath();
                  cxt.rect(y * userRect.size, x * userRect.size, userRect.size, userRect.size);
                  cxt.stroke();
                  cxt.closePath();
                }
              }
            }
          })(i, j);

        }
      }

    }
    usersCanvas.prototype.start = function() {
      var self = this;
      self.isbegin = true;

      var fn = function() {
        var seeds = seed();
        console.log(seeds);
        self.userRects.forEach(function(obj) {
          if (seeds.indexOf(obj.id) != -1) {
            obj.selected = true;
          } else {
            obj.selected = false;
          }
        });
        self.draw();
        if (self.isbegin) {
          win.requestAnimationFrame(fn);
        }
      }
      win.requestAnimationFrame(fn);
    }
    usersCanvas.prototype.end = function(cb) {
      var self = this;
      self.isbegin = false;

      var bingo = self.userRects.filter(function(obj) {
        if (!self.isbegin && obj.selected) {
          return true;
        } else {
          return false;
        }
      });
      console.log(bingo);
    }

    function userRect(size, id, sprite) {
      this.size = size;
      this.sprite = sprite;
      this.id = id;
    }


    function seed() {
      var selects = [];
      if (win.currentItem) {
        var howmany = win.currentItem.num;
        while (howmany != 0) {
          var binggoing = ~~(Math.random() * 50);
          if (selects.indexOf(binggoing) == -1) {
            selects.push(binggoing);
            howmany--;
          }

        }
      }
      return selects;
    }

    //初始化奖项
    var jxselect = doc.getElementById('jx-select');
    jxselect.addEventListener('change', function() {
      var self = this;
      var selectIndex = self.selectedIndex;
      if (selectIndex != 0) {
        var item = win.jxItems.find(function(c, i) {
          if (c.id == self.options[selectIndex].value) {
            return true;
          }
        });
        win.currentItem = item;
        if (item) {
          doc.querySelector('.note').innerHTML = item.desc + "(" + item.name + ")" + ",中奖名单:";
        }
      } else {
        win.currentItem = null;
        doc.querySelector('.note').innerHTML = "";
      }
    });
    if (win.jxItems) {
      win.jxItems.forEach(function(obj, index) {
        var option = new Option(obj.name + "(" + obj.desc + ")", obj.id);
        jxselect.add(option);
      });
    }

    //初始化参与抽奖人
    var users$el = doc.querySelector('.users');
    var range = users$el.getBoundingClientRect();
    var canvas = doc.getElementById("canvas");
    canvas.width = range.width > range.height ? range.height : range.width;
    canvas.height = range.width > range.height ? range.height : range.width;
    if (win.users) {
      var usernums = win.users.length;
      console.log(usernums)
      var columns = Math.floor(Math.sqrt(usernums));
      var rows = Math.ceil(usernums / columns);
      console.log(columns, rows)
      var userRectSize = Math.floor(canvas.width / (columns > rows ? columns : rows));

      var userRects = [];
      win.users.forEach(function(obj) {
        userRects.push(new userRect(userRectSize, obj.id, obj.imgurl));
      });

      win.uc = new usersCanvas(rows, columns, userRects, canvas);
      win.uc.draw();
    }


    //操作按钮
    var startBtn = doc.getElementById('start');
    var endBtn = doc.getElementById('end');
    startBtn.addEventListener('click', function() {
      if (win.currentItem) {
        if (win.uc && !win.uc.isbegin) {
          win.uc.start();
        }
      } else {
        alert("请选择奖项");
      }

    });
    endBtn.addEventListener('click', function() {
      if (win.currentItem) {
        if (win.uc && win.uc.isbegin) {
          win.uc.end();
        }
      } else {
        alert("请选择奖项");
      }
    });

  }
})(window, document);
