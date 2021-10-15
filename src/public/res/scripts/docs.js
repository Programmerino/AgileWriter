function elementIsEmpty(el) {
    return (/^(\s|&nbsp;)*$/.test(el.innerHTML));
}

function createNewCard(currCell){
    var newCard = document.createElement('div');
    var upperCard = document.createElement('div');
    var upperCardClasses = upperCard.classList;
    upperCardClasses.add("card-body");
    upperCardClasses.add("text-center");
    var upperCardImg = document.createElement('img');
    upperCardImg.src = "https://static.thenounproject.com/png/859737-200.png";
    upperCardImg.height = 150;
    upperCardImg.width = 150;
    upperCard.appendChild(upperCardImg);

    var lowerCard = document.createElement('div');
    var lowerCardClasses = lowerCard.classList;
    lowerCardClasses.add("card-footer");
    lowerCardClasses.add("text-center");
    var lowerCardLink = document.createElement('a');
    lowerCardLink.href = "#";
    lowerCardLink.innerText = "Document 1";
    lowerCard.appendChild(lowerCardLink);

    newCard.appendChild(upperCard);
    newCard.appendChild(lowerCard);
    var newCardClasses = newCard.classList;
    newCardClasses.add("card");

    currCell.appendChild(newCard);
}

function createNewDocument() {
    console.log("hello");
    var table = document.getElementById("curr_user_documents");
    for(var i = 0; i < table.rows.length;i++) {
        var row = table.rows[i];
        for(var j = 0; j < 4; j++) {
            if(j < 3 && row.cells[j] == undefined) {
                var blankCell = document.createElement('td');
                row.appendChild(blankCell);
            }
            col = row.cells[j];

            if(elementIsEmpty(col))
                {
                    createNewCard(col);
                    
                    if(j == 3) {
                        var newRow = document.createElement('tr');
                        var newRowCell = document.createElement('td');
                        newRow.appendChild(newRowCell);
                        table.appendChild(newRow);
                        return;
                    }
                    if(j<3) {
                        var newRowCell = document.createElement('td');
                        table.rows[i].appendChild(newRowCell);
                        return;
                    }
                }
                
            if(!elementIsEmpty(col) && j == 3 && i == table.rows.length - 1)
                {
                    var newRow = document.createElement('tr');
                    var newRowCell = document.createElement('td');
                    createNewCard(newRowCell);
                    var newRowCellBlank = document.createElement('td');
                    newRow.appendChild(newRowCell);
                    newRow.appendChild(newRowCellBlank);
                    table.appendChild(newRow);
                    return;
                }
                
        }
    }
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