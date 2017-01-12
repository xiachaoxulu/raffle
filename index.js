;
(function(win, doc) {
  win.onload = function() {



    function usersCanvas(r, c, userRects, canvas) {
      this.rows = r;
      this.columns = c;
      this.userRects = userRects;
      this.ctx = canvas.getContext('2d');
      this.canvas = canvas;
      this.isbegin = false;
    }
    usersCanvas.prototype.init = function() {
      var self = this;
      var ctx = self.ctx;
      ctx.lineWidth = "1";
      ctx.strokeStyle = "white";
      ctx.clearRect(0, 0, self.canvas.width, self.canvas.height);
      for (var i = 0; i < self.rows; i++) {
        for (var j = 0; j < self.columns; j++) {
          (function(x, y) {
            var userRect = self.userRects[x * self.columns + y];
            if (userRect) {
              userRect.x = x;
              userRect.y = y;
              var spritesheet = new Image();
              spritesheet.src = userRect.sprite;
              spritesheet.onload = function() {
                ctx.drawImage(spritesheet, y * userRect.size, x * userRect.size, userRect.size, userRect.size);
                ctx.beginPath();
                ctx.rect(y * userRect.size + y, x * userRect.size + x, userRect.size - 1, userRect.size - 1);
                ctx.stroke();
                ctx.closePath();
              }
            }
          })(i, j);

        }
      }
    }
    usersCanvas.prototype.draw = function() {
      var self = this;
      var ctx = self.ctx;
      ctx.clearRect(0, 0, self.canvas.width, self.canvas.height);
      self.userRects.filter(function(item) {
        if (!item.selected) {
          return true
        }
      }).forEach(function(item) {
        drawItem(item);
      })
      self.userRects.filter(function(item) {
        if (item.selected) {
          return true
        }
      }).forEach(function(item) {
        drawItem(item);
      })

      function drawItem(userRect) {
        var spritesheet = new Image();
        spritesheet.src = userRect.sprite;
        ctx.drawImage(spritesheet, userRect.y * userRect.size, userRect.x * userRect.size, userRect.size, userRect.size);
        ctx.save();
        if (self.isbegin && userRect.selected) {

          ctx.lineWidth = "1";
          ctx.strokeStyle = "blue";

        }
        if (!self.isbegin && userRect.selected) {

          ctx.lineWidth = "2";
          ctx.strokeStyle = "red";

        }
        ctx.beginPath();
        ctx.rect(userRect.y * userRect.size, userRect.x * userRect.size, userRect.size, userRect.size);
        ctx.stroke();
        ctx.closePath();
        ctx.restore();
      }
    }
    usersCanvas.prototype.start = function() {
      var self = this;
      self.isbegin = true;

      self.$timer = win.setInterval(function() {
        var seeds = seed();
        self.userRects.forEach(function(obj) {
          if (seeds.indexOf(obj.id) != -1) {
            obj.selected = true;
          } else {
            obj.selected = false;
          }
        });
        self.draw();
        if (!self.isbegin) {
          win.clearInterval(self.$timer);
        }
      }, 100);
    }
    usersCanvas.prototype.end = function(cb) {
      var self = this;
      if (!self.isbegin) {
        return;
      }
      self.isbegin = false;
      var bingo = self.userRects.filter(function(obj) {
        if (obj.selected) {
          return true;
        } else {
          return false;
        }
      });
      cb && cb(bingo);
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
          var binggoing = ~~(Math.random() * win.users.length);
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
      var columns = Math.floor(Math.sqrt(usernums));
      var rows = Math.ceil(usernums / columns);
      var userRectSize = Math.floor(canvas.width / (columns > rows ? columns : rows));

      var userRects = [];
      win.users.forEach(function(obj) {
        userRects.push(new userRect(userRectSize, obj.id, obj.imgurl));
      });

      win.uc = new usersCanvas(rows, columns, userRects, canvas);
      win.uc.init();
    }


    //操作按钮
    var startBtn = doc.getElementById('start');
    var endBtn = doc.getElementById('end');
    var copyBtn = doc.getElementById('copy');
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
          win.uc.end(function(data) {
            var list = doc.querySelector('.lucky-users');
            if (data.length > 0) {
              var userlists = win.users.filter(function(c) {
                if (data.some(function(u) {
                    if (u.id == c.id) {
                      return true;
                    }
                  })) {
                  return true;
                } else {
                  return false
                }
              });
              var html = "";
              userlists.forEach(function(c) {
                var tpl = `<li><img src="${c.imgurl}" alt="" /><span class='name'>${c.name}</span></li>`;
                html += tpl;
              });
              list.innerHTML = html;
            }

          });
        }
      } else {
        alert("请选择奖项");
      }
    });
    copyBtn.addEventListener('click', function() {
      var list = doc.querySelector('.lucky-users');
      var aside = doc.querySelector('aside');
      if (list.childNodes.length > 0) {
        var range = doc.createRange();
        range.selectNode(aside);
        range.setStart(aside,3);
        win.getSelection().empty();
        win.getSelection().addRange(range);
        document.execCommand('copy');
        win.getSelection().empty();
        alert("已复制到剪贴板");
      } else {
        alert("当前没有获取人员");
      }
    });

  }
})(window, document);
