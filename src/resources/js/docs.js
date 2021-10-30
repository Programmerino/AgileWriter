function elementIsEmpty(el) {
    return (/^(\s|&nbsp;)*$/.test(el.innerHTML));
}

function createCard(parent_element, final_element){
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
	card_link.href = "#";
	card_footer.innerText = "Document 1";

	card.classList.add("card");
    card_body.classList.add("card-body");
    card_body.classList.add("text-center");
    card_footer.classList.add("card-footer");
    card_footer.classList.add("text-center");
	container.classList.add("col-auto");

	card_body.appendChild(card_image);
	card_link.appendChild(card_body);
	card_link.appendChild(card_footer);
	card.appendChild(card_link);
	container.appendChild(card);
    // parent_element.insertBefore(container, parent_element.lastElementChild);
}

function createNewDocument() {
    var container = document.getElementById("document_window");
	createCard(container);
    // for(var i = 0; i < table.rows.length;i++) {
    //     var row = table.rows[i];
    //     for(var j = 0; j < 4; j++)
	// 	{
    //         if(j < 3 && row.cells[j] == undefined)
	// 		{
    //             var blankCell = document.createElement('td');
    //             row.appendChild(blankCell);
    //         }
    //         col = row.cells[j];

    //         if(elementIsEmpty(col))
	// 		{
	// 			createCard(col);
				
	// 			if(j == 3) {
	// 				var newRow = document.createElement('tr');
	// 				var newRowCell = document.createElement('td');
	// 				newRow.appendChild(newRowCell);
	// 				table.appendChild(newRow);
	// 				return;
	// 			}
	// 			if(j<3) {
	// 				var newRowCell = document.createElement('td');
	// 				table.rows[i].appendChild(newRowCell);
	// 				return;
	// 			}
	// 		}
    //         if(!elementIsEmpty(col) && j == 3 && i == table.rows.length - 1)
	// 		{
	// 			var newRow = document.createElement('tr');
	// 			var newRowCell = document.createElement('td');
	// 			createNewCard(newRowCell);
	// 			var newRowCellBlank = document.createElement('td');
	// 			newRow.appendChild(newRowCell);
	// 			newRow.appendChild(newRowCellBlank);
	// 			table.appendChild(newRow);
	// 			return;
	// 		}      
    //     }
    // }
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