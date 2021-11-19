const CLICK_VS_DRAG_THRESHOLD = 20; // Measured in pixels

delete_params = {
	type: '',
	src: '', 
	dest: '', 
	current: ''
}

function elementIsEmpty(el) {
    return (/^(\s|&nbsp;)*$/.test(el.innerHTML));
}

function createDocumentCard(title, link){
	let document_window = document.getElementById("document_window");
	let container = document.createElement('div');
    let card = document.createElement('div');
    let card_body = document.createElement('div');
	let card_footer = document.createElement('div');
    let card_image = document.createElement('img');
	let card_link = document.createElement('a')

	card.style.width = "200px";
    card_image.src = "/resources/img/document.png";
    card_image.height = 150;
    card_image.width = 150;
	card_link.href = link;
	card_footer.innerText = title;

	card.classList.add("card");
	card.classList.add("border-0");
	card.classList.add("bg-transparent");
    card_body.classList.add("card-body");
    card_body.classList.add("text-center");
	card_body.classList.add("bg-transparent");
    card_footer.classList.add("card-footer");
    card_footer.classList.add("text-center");
	card_footer.classList.add("bg-transparent");
	container.classList.add("col-auto");

	card_body.appendChild(card_image);
	card_link.appendChild(card_body);
	card_link.appendChild(card_footer);
	card.appendChild(card_link);
	container.appendChild(card);
    document_window.insertBefore(container, document_window.lastElementChild);
}

function createNewDocument() {
	createDocumentCard("Untitled " + document_window.childElementCount, "#");
}

// ------------- POSTING WITH AJAX ----------------

function createNewFolder() {
	let parent_id = document.getElementById("document_window").parentElement.id.replace("folder-","");
	$.ajax({
		url: '/NewFolder',
		type: 'POST',
		cache: false,
		data: {parent: parent_id},
		success: results => {
			// Add new folder icon
			let doc_window = document.getElementById("document_window");
			let new_folder = document.createElement('div');
			let new_folder_body = document.createElement('div');
			let new_folder_link = document.createElement('a');
			let new_folder_inner = document.createElement('div');
			let new_folder_img = document.createElement('img');
			let new_folder_name = document.createElement('input');
		
			new_folder.classList		= "col-auto"
			new_folder_body.classList	= "draggable folder"
			new_folder_link.classList	= "card bg-transparent border-0"
			new_folder_inner.classList	= "card-body bg-transparent text-center"
			new_folder_name.classList	= "card-footer bg-transparent text-center"
		
			new_folder.id = "folder-" + results.id;
			new_folder_name.id = "rename-" + results.id;
			
			new_folder_body.setAttribute('onmousedown','updateDraggable(this)');
			new_folder_link.href = window.location.href + '/' + results.name.replace(/ /g,'-');
			new_folder_img.src = "/resources/img/folder.png";
			new_folder_img.width = 150;
			new_folder_img.height = 150;
			new_folder_img.setAttribute('ondragstart','return false;');
			new_folder_name.value = results.name;
			new_folder_name.addEventListener("focusin", event => {old_name = event.target.value;})
			new_folder_name.addEventListener("focusout", event => {item_rename('folder-'+results.id);})
			new_folder_name.addEventListener("keyup", event => {
				event.preventDefault();
				if (event.key === "Enter") new_folder_name.blur();
			});
		
			new_folder.append(new_folder_body);
			new_folder_body.append(new_folder_link);
			new_folder_link.append(new_folder_inner);
			new_folder_inner.append(new_folder_img);
			new_folder_body.append(new_folder_name);
			doc_window.prepend(new_folder);
			doc_window.insertBefore(new_folder,document.querySelector('.draggable.file').parentElement);

			new_folder.style.width = new_folder.offsetWidth + "px";

			// Add new directory entry
			let new_dir          = document.createElement('div');
			let new_dir_content  = document.createElement('div');
			let new_dir_header   = document.createElement('div');
			let new_dir_body     = document.createElement('div');
			let new_dir_link     = document.createElement('a');
			let new_dir_toggle   = document.createElement('div');
			let new_dir_button   = document.createElement('button');
			let new_dir_collapse = document.createElement('div');
			let new_dir_collapse_body = document.createElement('div');

			new_dir.classList          = "accordian accordian-flush"
			new_dir_content.classList  = "accordian-item"
			new_dir_header.classList   = "accordian-header"
			new_dir_body.classList     = "btn-group w-100"
			new_dir_link.classList     = "list-group-item list-group-item-action text-start w-100 border-0 ps-0"
			new_dir_button.classList   = "accordion-button collapsed w-auto py-2 px-1"
			new_dir_collapse.classList = "accordian-collapse collapse"
			new_dir_collapse_body.classList = "accordian-body"

			new_dir.id			= `folder-${results.id}-directory`;
			new_dir_link.id 	= `rename-target-${results.id}`;
			new_dir_toggle.id 	= `folder-${results.id}-toggle`;
			new_dir_collapse.id = `collapse-${results.id}`;

			new_dir_body.setAttribute('role', 'expand');
			new_dir_body.setAttribute('aria-label','Expand directory');
			new_dir_link.setAttribute('type', 'button');
			new_dir_link.setAttribute('href', window.location.href + '/' + results.name.replace(/ /g,'-'));
			new_dir_button.setAttribute('data-bs-toggle', 'collapse');
			new_dir_button.setAttribute('data-bs-target', `#collapse-${results.id}`);
			new_dir_button.setAttribute('onclick', `directory_toggle(${results.id})`);

			new_dir.append(new_dir_content);
			new_dir_content.append(new_dir_header);
			new_dir_header.append(new_dir_body);
			new_dir_body.append(new_dir_link);
			new_dir_body.append(new_dir_toggle);
			new_dir_toggle.append(new_dir_button);
			new_dir_content.append(new_dir_collapse);
			new_dir_content.append(new_dir_collapse_body);

			new_dir_toggle.hidden = true;
			new_dir_link.innerText = results.name;

			let target_position_id = doc_window.parentElement.id.replace('folder','collapse');
			document.getElementById(target_position_id).firstElementChild.append(new_dir);
		}
	});
}

function directory_toggle(folder_id) {
	$.ajax({
		url: '/DocumentBrowser/UpdateState',
		type: 'POST',
		cache: false,
		data: {folder: folder_id}
	});
}

// Add event listeners to add file rename shortcuts

var dir_contents = document.getElementById("document_window").children;
var old_name;

for (let i=0; i<dir_contents.length-1; i++) {
	let target_id = dir_contents[i].id
	let target = dir_contents[i].lastElementChild.lastElementChild;
	target.addEventListener("focusin", event => {old_name = event.target.value;})
	target.addEventListener("focusout", event => {item_rename(target_id);})
	target.addEventListener("keyup", event => {
		event.preventDefault();
		if (event.key === "Enter") target.blur();
	});
}

function item_rename(target_id) {
	let type = target_id.substring(0,  target_id.search('-'));
	let id   = target_id.substring(1 + target_id.search('-'));
	let dir_elem = document.getElementById('rename-target-' + id);
	let target   = document.getElementById('rename-' + id);
	let link_target = target.parentElement.firstElementChild;
	let parent = document.getElementById('document_window').parentElement.id.substring(7);
	let new_name = target.value;
	target.blur();
	if (type == 'folder') {
		let matching_target = document.getElementById('rename-target-' + id)
		let old_path = link_target.href;
		let new_path = old_path.replace(old_name.replace(/ /g,'-'),new_name.replace(/ /g,'-'));
		matching_target.innerText = new_name;
		link_target.setAttribute('href', new_path);
		dir_elem.setAttribute('href', new_path);
		$.ajax({
			url: '/DocumentBrowser/RenameFolder',
			type: 'POST',
			cache: false,
			data: {folder: id, new_name: new_name},
			success: (result) => {
				if (result.status == 409) {
					target.value = old_name;
					matching_target.innerText = old_name;
					link_target.href = old_path;
					$('#rename-conflict-modal').modal('show')
				}
			},
			error: () => {
				target.value = old_name;
				matching_target.innerText = old_name;
				link_target.href = old_path;
			}
		});
	} else {
		link_target = link_target.firstElementChild;
		let old_link = link_target.value;
		let new_link = old_link.replace(old_name,new_name.replace(/ /g,'%20'));
		link_target.value = new_link
		$.ajax({
			url: '/DocumentBrowser/RenameFile',
			type: 'POST',
			cache: false,
			data: {folder: parent, old_name: id.replace(/-/g,' '), new_name: new_name},
			success: (result) => {
				if (result.status == 409) {
					target.value = old_name;
					link_target.value = old_link;
					$('#rename-conflict-modal').modal('show')
				}
			},
			error: () => {
				target.value = old_name;
				link_target.value = old_link;
			}
		});
	}
}

function moveItem(type, src, dest, current_folder) {
	let first_folder = document_window.children[1].id;
	$.ajax({
		url: '/MoveItem',
		type: 'POST',
		cache: false,
		data: {
			type: type,
			source: src,
			destination: dest
		},
		success: result => {
			if (result.status == 200) {		
				temp.remove()
				if (type == 'folder') {
					document.getElementById("folder-"+dest+"-toggle").hidden = false;
					document.getElementById("collapse-"+dest).firstElementChild.appendChild(
						document.getElementById("folder-"+src +"-directory"));
					if (first_folder.substring(0,6) === 'folder')
						document.getElementById(current_folder+'-toggle').hidden = true;
				}
			} else {
				$('#move-conflict-modal').modal('show')
				resetDraggedIcon()
			}
		},
		error: results => {
			
		}
	});
}

function deleteItem(type, src, dest, current_folder) {
	let first_folder = document_window.children[1].id;	
	$.ajax({
		url: '/DeleteItem',
		type: 'POST',
		cache: false,
		data: {
			type: type,
			source: src
		},
		success: result => {
			if (result.status == 200) {
				temp.remove()
				if (type == 'folder') {
					if (first_folder.substring(0,6) === 'folder')
						document.getElementById(current_folder+'-toggle').hidden = true;
					document.getElementById('folder-'+src+'-directory').remove();
				}
			}
		},
		error: results => {
			
		}
	});
	resetTrashIcon();
}

// --------- START OF DRAG & DROP CODE ------------

var drag = null, hover = null, temp = null;
var dragPos = [0,0];
var mousePos = [0,0];
var startPos = [0,0];
var startZIndex = 0;
var enableClick = true;

for (let icon of document.getElementsByClassName("draggable"))
	icon.parentElement.style.width = icon.parentElement.offsetWidth + "px";

function updateDraggable(icon) {
	let valid_drag = true;
	document.elementsFromPoint(mousePos[0], mousePos[1]).forEach(element => {
		if (element.tagName === 'INPUT') {
			valid_drag = false;
		}
	});
	if (valid_drag && drag === null && icon.innerText != '...') {
		drag = icon;
		startZIndex = drag.style.zIndex;
		startPos[0] = drag.offsetLeft;
		startPos[1] = drag.offsetTop;
		dragPos[0] = mousePos[0] - startPos[0];
		dragPos[1] = mousePos[1] - startPos[1];
		drag.style.position = "absolute"
		drag.style.zIndex = 99999;
		drag.style.backgroundColor = 'white';
		drag.style.opacity = 0.5;
	}
}

setInterval(()=> {
	if (drag) {
		drag.style.left = mousePos[0] - dragPos[0] + "px";
		drag.style.top  = mousePos[1] - dragPos[1] + "px";
	}
},10);

document.onmousemove = () => {
	mousePos[0] = window.event.clientX;
	mousePos[1] = window.event.clientY;
	if (drag) {
		if (CLICK_VS_DRAG_THRESHOLD < Math.abs(mousePos[0] - startPos[0] - dragPos[0]) + Math.abs(mousePos[1] - dragPos[1] - startPos[1]))
			enableClick = false;
	
		let under_mouse = document.elementsFromPoint(mousePos[0], mousePos[1])
		for (let element of under_mouse) {
			if (element != drag && element.classList[0] == 'draggable') {
				under_mouse = element;
				if (element.classList[1] == 'folder') {
					if (hover != under_mouse) {
						if (hover) hover.parentElement.style.backgroundColor = 'transparent';
						hover = under_mouse;
					}
					hover.parentElement.style.backgroundColor = '#3ac7b4';
					break;
				}
				if (element.classList[1] == 'trash') {
					if (hover != under_mouse) {
						if (hover) hover.parentElement.style.backgroundColor = 'transparent';
						hover = under_mouse;
					}
					hover.parentElement.style.backgroundColor = '#f62f40';
					hover.firstElementChild.firstElementChild.src = "/resources/img/thrown-away.png"
					break;
				}
			}
		}

		if (hover && hover != under_mouse) {
			resetTrashIcon()
			hover.parentElement.style.backgroundColor = 'transparent';
			hover = null;
		}
	}
	else enableClick = true;
}

document.onmouseup = (e) => {
	if (drag != null) {
		if(hover) {
			hover.parentElement.style.backgroundColor = 'transparent';
			
			let folder = drag.classList[1] === "folder";
			let remove = hover.classList[1] === "trash";
			let move = hover.classList[1] === "folder";

			let src  = drag .parentElement.id.replace('folder-','')
			let dest = hover.parentElement.id.replace('folder-','');
			if (!folder) src = drag.firstElementChild.firstElementChild.value;

			let document_window = document.getElementById("document_window");
			let current_folder = document_window.parentElement.id;
			
			temp = drag.parentElement;
			
			if (remove) {
				$('#delete-modal').modal('show')
				drag.style.zIndex = 0;
				delete_params = {
					type: drag.classList[1],
					src: src, 
					dest: dest, 
					current: current_folder
				}
			}
			else if (move) moveItem(drag.classList[1], src, dest, current_folder);
			
			if (move || remove) resetDraggedIcon()

			hover = null;
		} else {
			resetTrashIcon()
			resetDraggedIcon()
		}
	}
	return enableClick;
}

document.onclick = (e) => {
	return enableClick;
}

function resetDraggedIcon() {
	drag.style.backgroundColor = 'transparent';
	drag.style.opacity = 1;
	drag.style.zIndex = startZIndex
	drag.style.position = "relative";
	drag.style.left = "0px";
	drag.style.top  = "0px";
	drag = null;
}

function resetTrashIcon() {
	document.getElementsByClassName("trash")[0].firstElementChild.firstElementChild.src = "/resources/img/pre-thrown-away.png";
}

function deleteItemShortcut() {
	deleteItem(delete_params.type, delete_params.src, delete_params.dest, delete_params.current);
}


