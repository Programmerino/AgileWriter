function elementIsEmpty(el) {
    return (/^(\s|&nbsp;)*$/.test(el.innerHTML));
}

function createDocumentCard(target, title, link){
	let container = document.createElement('div');
    let card = document.createElement('div');
    let card_body = document.createElement('div');
	let card_footer = document.createElement('div');
    let card_image = document.createElement('img');
	let card_link = document.createElement('a')

	card.style.width = "200px";
    card_image.src = "../../resources/img/document.png";
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
    target.insertBefore(container, target.lastElementChild);
}

function createNewDocument() {
	let document_window = document.getElementById("document_window");
	createDocumentCard(document_window, "Untitled " + document_window.childElementCount, "#");
}

function loadDocuments() {
	console.log(page_scripts);
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