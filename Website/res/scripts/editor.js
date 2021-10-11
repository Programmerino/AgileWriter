const font_sizes = ['8px','9px','10px','12px','14px','16px','20px','24px','32px','42px','54px','68px','84px','98px']
var Size = Quill.import('attributors/style/size');
Size.whitelist = font_sizes
Quill.register(Size,true)

var editor = new Quill('#editor', {
    theme: 'snow',
    placeholder: 'Compose an epic...',
    modules: {
        toolbar: [
            [{'font':[]},{'size':font_sizes},{'align':[]}],
            ['bold','italic','underline','strike'],
            [{'color':[]},{'background':[]}],
            []
        ]
    }
});