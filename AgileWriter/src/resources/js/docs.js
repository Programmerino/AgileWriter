const CLICK_VS_DRAG_THRESHOLD = 12;

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

function createNewFolder() {
    var folderList = document.getElementById("file_directory");
    var newListItem = document.createElement("li");
    var newListItemClasses = newListItem.classList;
    newListItemClasses.add("list-group-item");

    var linkToFolder = document.createElement("a");
    linkToFolder.href = "#";
    linkToFolder.innerText = "New Folder";

    newListItem.append(linkToFolder);
    folderList.append(newListItem);
}


// ------------- POSTING WITH AJAX ----------------

function directory_toggle(folder_id) {
	$.ajax({
		url: '/DocumentBrowser/UpdateState',
		type: 'POST',
		cache: false,
		data: {folder: folder_id}
	});
}

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
	let target = document.getElementById('rename-' + id);
	let link_target = target.parentElement.firstElementChild;
	let parent = document.getElementById('document_window').parentElement.id.substring(7);
	let new_name = target.value;
	target.blur();
	if (type == 'folder') {
		let matching_target = document.getElementById('rename-target-' + id)
		let old_path = link_target.href;
		let new_path = old_path.replace(old_name,new_name);
		matching_target.innerText = new_name;
		link_target.href = new_path;
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
				}
			},
			error: () => {
				target.value = old_name;
				link_target.value = old_link;
			}
		});
	}
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
			console.log(element.tagName);
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
		drag.style.zIndex = 9999999;
		drag.style.backgroundColor = 'white';
		drag.style.opacity = 0.75;
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
			if (element != drag && element.classList[0] == 'draggable' && element.classList[1] == 'folder') {
				under_mouse = element;
				if (hover != under_mouse) {
					if (hover) hover.parentElement.style.backgroundColor = 'transparent';
					hover = under_mouse;
				}
				hover.parentElement.style.backgroundColor = '#3ac7b4';
				break;
			}
		}

		if (hover && hover != under_mouse) {
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

			let folder = drag.classList[1] === "folder"
			let src  = drag .parentElement.id.replace('folder-','')
			let dest = hover.parentElement.id.replace('folder-','');
			if (!folder) src = drag.firstElementChild.firstElementChild.value;

			let document_window = document.getElementById("document_window");
			let current_folder = document_window.parentElement.id;
			let first_folder = document_window.children[1].id;
			
			temp = drag.parentElement;
			
			$.ajax({
				url: '/MoveItem',
				type: 'POST',
				cache: false,
				data: {
					type: drag.classList[1],
					source: src,
					destination: dest
				},
				success: result => {
					if (result.status == 200) {		
						temp.remove()
						if (folder) {
							document.getElementById("folder-"+dest+"-toggle").hidden = false;
							document.getElementById("folder-"+dest+"-directory").lastElementChild.lastElementChild.lastElementChild.appendChild(
								document.getElementById("folder-"+src +"-directory"));
							if (first_folder.substring(0,6) === 'folder')
								document.getElementById(current_folder+'-toggle').hidden = true;
						}
					}
				},
				error: results => {
					
				}
			});
			drag = hover = null;
		} else {
			drag.style.backgroundColor = 'transparent';
			drag.style.opacity = 1;
			drag.style.zIndex = startZIndex
			drag.style.position = "relative";
			drag.style.left = "0px";
			drag.style.top  = "0px";
			drag = null;
		}
	}
	return enableClick;
}

document.onclick = (e) => {
	return enableClick;
}
