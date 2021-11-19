const font_fam = ['Abel','Amatic SC','Andada Pro','Anton','Bebas Neue','Birthstone','Caveat','Crimson Text','Dancing Script','Dosis','Ephesis','Explora','Festive','Gluten','Heebo','Henny Penny','Inconsolata','Josefin Sans','Indie Flower','Karla','Karma','Lato','Long Cang','Lora','monospace','Montserrat','Mukta','Noto Sans','Oswald','Oxygen','Poppins','Quicksand','Roboto','Sans Serif','Scheherazade','serif','Source Code Pro','Shadows Into Light','Teko','Texturina','Ubuntu','Vollkorn','Work Sans','Xanh Mono','Yanone Kaffeesatz','ZCOOL KuaiLe']
const font_sizes = ['8px','9px','10px','11px','12px','13px','14px','16px','18px','20px','24px','32px','42px','54px','68px','84px','98px']
var Font = Quill.import('attributors/style/font');
var Size = Quill.import('attributors/style/size');
Font.whitelist = font_fam
Size.whitelist = font_sizes
Quill.register(Font,true)
Quill.register(Size,true)

class Counter {
    constructor(quill, options) {
      this.quill = quill;
      this.options = options;
      this.container = document.querySelector(options.container);
      quill.on('text-change', this.update.bind(this));
      this.update();  // Account for initial contents
    }
  
    calculate() {
      let text = this.quill.getText();
      if (this.options.unit === 'word') {
        text = text.trim();
        // Splitting empty text returns a non-empty array
        return text.length > 0 ? text.split(/\s+/).length : 0;
      } else {
        return text.length;
      }
    }
    
    update() {
      var length = this.calculate();
      var label = this.options.unit;
      if (length !== 1) {
        label += 's';
      }
      this.container.innerText = length + ' ' + label;
    }
  }

function loadEditor() {
    document.getElementsByClassName('ql-font')[0].children[0].setAttribute('data-value','Sans Serif')
    document.getElementsByClassName('ql-size')[0].children[0].setAttribute('data-value','13px')
    document.getElementsByClassName('ql-font')[0].style.width = '150px'
    document.getElementsByClassName('ql-size')[0].style.width = '60px'
    document.getElementsByClassName('ql-align')[0].firstElementChild.style.paddingTop='0px'
    // const bold = document.getElementsByClassName('ql-bold')[0].parentNode
    // bold.parentNode.insertBefore(document.createElement('BR'),bold)
	let loaded_delta = JSON.parse(document.getElementById('editor').firstElementChild.firstElementChild.innerHTML);
	//console.log(loaded_delta);
	editor.setContents(loaded_delta);
}

function getDocument() {
	let url = window.location.href
	let file_key = url.substring(url.search('Editor/')+7)
	let file_folder = file_key.substring(0, file_key.search('/'));
	let file_name = file_key.substring(1+file_key.search('/')).replace(/%20/g,' ');
	document.getElementById("currentDirectoryID").setAttribute("value", file_folder);


    console.log("Hello there!!!!!!");
    //var editor = document.getElementById("editor");
    var contents = editor.getContents();
    var stringContents = JSON.stringify(contents);
    document.getElementById("documentContents").setAttribute("value", stringContents);

    var form = document.getElementById("saveDocument");

    var title = document.getElementById("docTitle").value;
    if(!title) title = document.getElementById("docTitle").innerHTML;
    document.getElementById("documentTitle").setAttribute("value", title);

    var selectedDirectory = document.getElementById("selectDirec");
    var directory = document.getElementById("docDirec").innerHTML;
    if(selectedDirectory) {
		directory = selectedDirectory.value - 1;
		if(directory < 0) {directory = 0;}
	}
    document.getElementById("documentDirectory").setAttribute("value", directory);
    form.submit();
}

Quill.register('modules/counter', Counter);

var editor = new Quill('#editor', {
    theme: 'snow',
    placeholder: 'Compose an epic...',
    modules: {
        counter: {
            container: '#counter',
            unit: 'word'
        },
        toolbar: [
            [
                {'font':font_fam},
                {'size':font_sizes}
            ],
            [
                {'align':[]},
                {'indent':'-1'},
                {'indent':'+1'},
                {'list':'bullet'},
                {'list':'ordered'}
            ],
            [
                'bold',
                'italic',
                'underline',
                'strike',
            ],
            [
                {'color':[]},
                {'background':[]},
                {'script':'sub'},
                {'script':'super'}
            ],
            [
                'formula',
                'code-block',
                'blockquote',
                'link',
                'image',
                'video'
            ]
        ]
    }
});

// The bold and underline keyboard shortcuts are already built

// Keyboard "ALIGN RIGHT" shortcut
editor.keyboard.addBinding({
    key: 'R',
    shortKey: true,
    shiftKey: true
}, function(range) {
    this.quill.formatText(range, 'align', 'right', true);
});

// Keyboard "ALIGN LEFT" shortcut
editor.keyboard.addBinding({
    key: 'L',
    shortKey: true,
    shiftKey: true
}, function(range, context) {
    this.quill.formatText(range, 'align', 'left', true);
});

// Keyboard "ALIGN CENTER" shortcut
editor.keyboard.addBinding({
    key: 'T',
    shortKey: true,
    shiftKey: true
}, function(range, context) {
    this.quill.formatText(range, 'align', 'center', true);
});

// Keyboard "SAVE" shortcut
editor.keyboard.addBinding({ 
    key: 'S', 
    shortKey: true,
    shiftKey: true
}, function(range) {
    console.log('user hit command + s');
    return true;
});

// Keyboard "SAVE AS" shortcut
editor.keyboard.addBinding({
    key: 'A',
    shortKey: true,
    shiftKey: true
}, function(range) {
    console.log('user hit command + a');
    return true;
});


  
