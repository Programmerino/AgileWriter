const font_families = ['Abel','Amatic SC','Andada Pro','Anton','Bebas Neue','Birthstone','Caveat','Crimson Text','Dancing Script','Dosis','Ephesis','Explora','Festive','Gluten','Heebo','Henny Penny','Inconsolata','Josefin Sans','Indie Flower','Karla','Karma','Lato','Long Cang','Lora','monospace','Montserrat','Mukta','Noto Sans','Oswald','Oxygen','Poppins','Quicksand','Roboto','Sans Serif','Scheherazade','serif','Source Code Pro','Shadows Into Light','Teko','Texturina','Ubuntu','Vollkorn','Work Sans','Xanh Mono','Yanone Kaffeesatz','ZCOOL KuaiLe']
const font_sizes = ['8px','9px','10px','11px','12px','13px','14px','16px','18px','20px','24px','32px','42px','54px','68px','84px','98px']
var Font = Quill.import('attributors/style/font');
var Size = Quill.import('attributors/style/size');
Font.whitelist = font_families
Size.whitelist = font_sizes
Quill.register(Font,true)
Quill.register(Size,true)

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
    console.log("Hello there!!!!!!");
    //var editor = document.getElementById("editor");
    var contents = editor.getContents();
    var stringContents = JSON.stringify(contents);
    console.log(stringContents);
    document.getElementById("documentContents").setAttribute("value", stringContents);

    var form = document.getElementById("saveDocument");

    var title = document.getElementById("docTitle").value;
    if(!title) {
        title = document.getElementById("docTitle").innerHTML;
        
    }
    console.log(title);
    document.getElementById("documentTitle").setAttribute("value", title);

    var directory = document.getElementById("docDirec").innerHTML;
    document.getElementById("documentDirectory").setAttribute("value", directory);
    form.submit();
}

var editor = new Quill('#editor', {
    theme: 'snow',
    placeholder: 'Compose an epic...',
    modules: {
        toolbar: [
            [
                {'font':font_families},
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

modules.export(getDocument());