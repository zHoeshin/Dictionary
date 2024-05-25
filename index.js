const fuseOptions = {
	// isCaseSensitive: false,
	// includeScore: false,
	// shouldSort: true,
	// includeMatches: false,
	// findAllMatches: false,
	// minMatchCharLength: 1,
	// location: 0,
	// threshold: 0.6,
	// distance: 100,
	// useExtendedSearch: false,
	// ignoreLocation: false,
	// ignoreFieldNorm: false,
	// fieldNormWeight: 1,
	keys: [
        "word",
		"translation",
		"pronounciation",
		"meaning"
	]
};

const theme = document.getElementById("theme")

if (localStorage.getItem("fontsize") === null){
	localStorage.setItem("fontsize", "2vmin")
}

function setGlobalFontSize(size){
	for(let e of document.querySelectorAll('*')){
		e.style.fontSize = size;
	}
}
setGlobalFontSize(localStorage.getItem("fontsize"))


if (localStorage.getItem("theme") === null){
	localStorage.setItem("theme", "theme_default.css")
}
theme.href = localStorage.getItem("theme")

const aboutButton = document.getElementById("about")


const icon = document.getElementById("icon")
if (window.matchMedia('(prefers-color-scheme: dark)').matches){
	icon.href = "icon_white_blush.svg"
}


const emptyProject = {
	info: {
		author: "",
		primaryLanguage: "",
		secondaryLanguage: "",
		name: "",
		alphabet: "",
		sortBy: "primaryLanguage",
	},
	words: [

	]
}

let project = JSON.parse(JSON.stringify(emptyProject));

let projectEverChanged = false

const projectSettings = {
	lang1: document.getElementById("lang1"),
	lang2: document.getElementById("lang2"),
	author: document.getElementById("author"),
	name: document.getElementById("dictname"),
	alphabet: document.getElementById("alphabet"),
	sortBy: document.getElementById("sortby"),
	infofield: document.getElementById("infofield"),
	threeinrow: document.getElementById("threeinrow"),
	infofieldcss: document.getElementById("infofieldcss"),
	threeinrowcss: document.getElementById("threeinrowcss"),
}

const searchInput = document.getElementById("search")
searchInput.onchange = (event) => 
{
	let elements = document.getElementsByClassName("entry")

	for(let e of elements){
		e.style.display = searchInput.value.length == 0 ? "" : "none"
	}
	if(searchInput.value.length == 0){
		return
	}

	let list = []
	for(let e of elements){
		list.push({
			"word": document.querySelector(`div#${e.id} #word`).value,
			"translation": document.querySelector(`div#${e.id} #translation`).value,
			"pronounciation": document.querySelector(`div#${e.id} #pronounciation`).value,
			"meaning": document.querySelector(`div#${e.id} #meaning`).value,
			"id": e.id
		})
	}

    const fuse = new Fuse(list, fuseOptions);
    
    const searchPattern = event.target.value;
    
    for(let e of fuse.search(searchPattern)){
		document.querySelector(`div.entry#${e.id}`).style.display = ""
	}
}

function makeNewEntry(id){
	return `
	<div class="entry" id="${id}">
		<button class="delete" onclick="removeEntry(this.parentElement.id)">Trash</button>
		<input type="text" autocomplete="off" class="word" id="word">
		<input type="text" autocomplete="off" class="word" id="translation">
		<input type="text" autocomplete="off" class="word" id="pronounciation">
		<textarea class="word" id="meaning"></textarea>
	</div>`
}

function removeEntry(id){
	projectEverChanged = true
	document.querySelector(`div.entry#${id}`).remove()
}

function generateRandomString(length = 16){
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrtstuvxyz0123456789"
	
	let result = chars[Math.floor(Math.random() * (chars.length - 10))]
	for(let i = 0; i < length - 1; i ++){
		result += chars[Math.floor(Math.random() * chars.length)]
	}
	return document.querySelector(`div.contents div.entry#${result}`) === null ? result : generateRandomString(length)
}

function clearWords(){
	let elements = document.getElementsByClassName("entry")
	while(elements.length > 0){
		elements[0].remove()
	}
}

function clearWorkspace(data = emptyProject){
	project.info.primaryLanguage = projectSettings.lang1.value = data.info.primaryLanguage
	project.info.secondaryLanguage = projectSettings.lang1.value = data.info.secondaryLanguage
	project.info.author = projectSettings.author.value = data.info.author
	project.info.name = projectSettings.name.value = data.info.name

}

function loadWordsFromArray(words){
	for(let e of words){
		let id = generateRandomString(32)
		document.querySelector("div.contents").insertAdjacentHTML("beforeend", makeNewEntry(id))
		document.querySelector(`div#${id} #word`).value = e.word
		document.querySelector(`div#${id} #translation`).value = e.translation
		document.querySelector(`div#${id} #pronounciation`).value = e.pronounciation
		document.querySelector(`div#${id} #meaning`).value = e.meaning
	}
}

function load(){
	projectEverChanged = false

	var input = document.createElement('input')
    input.type = 'file'
    input.accept = 'json'
    
    input.onchange = e => { 
    
    var file = e.target.files[0]

    let ext = file.name.split('.').pop()

    var reader = new FileReader()
    reader.readAsText(file,'UTF-8')

    reader.onload = readerEvent => {
        var content = readerEvent.target.result
        if(ext == "json"){
			let data = JSON.parse(content)

			clearWorkspace(data)

			loadWordsFromArray(data.words)

		}else{
			return false
		}
    }
    
    }
    
    input.click()
}

function getWords(){
	let elements = document.getElementsByClassName("entry")
	let list = []
	for(let e of elements){
		list.push({
			"word": document.querySelector(`div#${e.id} #word`).value,
			"translation": document.querySelector(`div#${e.id} #translation`).value,
			"pronounciation": document.querySelector(`div#${e.id} #pronounciation`).value,
			"meaning": document.querySelector(`div#${e.id} #meaning`).value,
		})
	}
	return list
}

function save(){
	let list = getWords()

	let data = {
		info: {
			primaryLanguage: projectSettings.lang1.value,
			secondaryLanguage: projectSettings.lang2.value,
			author: projectSettings.author.value,
			name: projectSettings.name.value,
			infofield: projectSettings.infofield.checked,
			threeinrow: projectSettings.threeinrow.checked,
		},
		words: list
	}

	function saveTxtToFile(fileName, textData) {
        const blobData = new Blob([textData], { type: 'text/plain' });
        const urlToBlob = window.URL.createObjectURL(blobData);

        const a = document.createElement('a');
        a.style.setProperty('display', 'none');
        document.body.appendChild(a);
        a.href = urlToBlob;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(urlToBlob);
        a.remove();
    }

    saveTxtToFile(`${data.info.name}.json`, JSON.stringify(data));
}

const globalOverlay = document.getElementById("overlay")

const projectNotSavedOverlay = document.querySelector('div.wrapper#projectNotSavedWarning')

const addButton = document.getElementById("add")
addButton.onclick = () => {
	projectEverChanged = true
	document.querySelector("div.contents").insertAdjacentHTML("beforeend", makeNewEntry(generateRandomString(32)))
}

let interruptedByFileNotSavedAction

const loadButton = document.getElementById("load")
loadButton.onclick = () => {
    if(projectEverChanged){
		projectNotSavedOverlay.style.display = ""
		globalOverlay.style.display = ""

		interruptedByFileNotSavedAction = load
	}else{
		load()
	}
}
const saveButton = document.getElementById("save")
saveButton.onclick = () => {
	save()
}
const newProjectButton = document.getElementById("new")
newProjectButton.onclick = () => {
    if(projectEverChanged){
		projectNotSavedOverlay.style.display = ""
		globalOverlay.style.display = ""

		interruptedByFileNotSavedAction = clearWorkspace
	}else{
		clearWorkspace()
	}
}

const cancelProjectChangeRemoval = document.getElementById("cancelProjectChangesRemoval")
cancelProjectChangeRemoval.onclick = () => {
	projectNotSavedOverlay.style.display = "none"
	globalOverlay.style.display = "none"
}
const applyProjectChangeRemoval = document.getElementById("applyProjectChangesRemoval")
applyProjectChangeRemoval.onclick = () => {
	projectNotSavedOverlay.style.display = "none"
	globalOverlay.style.display = "none"

	try{
		interruptedByFileNotSavedAction()
	}catch(error){

	}
}

const settingsOverlay = document.getElementById("settings")

const cancelSettingsChangeButton = document.getElementById("cancelSettingsChange")
cancelSettingsChangeButton.onclick = () => {
	settingsOverlay.style.display = "none"
	globalOverlay.style.display = "none"

	projectSettings.lang1.value = project.info.primaryLanguage
	projectSettings.lang1.value = project.info.secondaryLanguage
	projectSettings.author.value = project.info.author
	projectSettings.name.value = project.info.name
	projectSettings.alphabet.value = project.info.alphabet
	projectSettings.sortBy.value = project.info.sortBy

	projectSettings.infofield.checked = project.info.infofield
	projectSettings.threeinrow.checked = project.info.threeinrow
}
const applySettingsChangeButton = document.getElementById("applySettingsChange")
applySettingsChangeButton.onclick = () => {
	projectEverChanged = true
	settingsOverlay.style.display = "none"
	globalOverlay.style.display = "none"
	
	project.info.primaryLanguage = projectSettings.lang1.value
	project.info.secondaryLanguage = projectSettings.lang1.value
	project.info.author = projectSettings.author.value
	project.info.name = projectSettings.name.value
	project.info.alphabet = (projectSettings.alphabet.value = projectSettings.alphabet.value.toLowerCase())
	project.info.sortBy = projectSettings.sortBy.value

	project.info.infofield = projectSettings.infofield.checked
	project.info.threeinrow = projectSettings.threeinrow.checked
	projectSettings.infofieldcss.href = `infofield_${project.info.infofield}.css`
	projectSettings.threeinrowcss.href = `threeinrow_${project.info.threeinrow}.css`
}

const projectSettingsButton = document.getElementById("settingsButton")
projectSettingsButton.onclick = () => {
	settingsOverlay.style.display = ""
	globalOverlay.style.display = ""
}

let alphabet = ""
function sorting(x, y){
	let sortBy = {
		"primaryLanguage": "word",
		"secondaryLanguage": "translation",
		"pronounciation": "pronounciation",
		"meaning": "meaning"
	}[project.info.sortBy]

	for(let i = 0; i < Math.min(x.length, y.length); i++){
		let a = x[sortBy][i]
		let b = y[sortBy][i]

		if(a == b) continue
		if( (alphabet.indexOf(a) == undefined) |
		(alphabet.indexOf(b) == undefined) ) continue

		return alphabet.indexOf(a) > alphabet.indexOf(b) ? -1 : 1
	}
	return x[sortBy].length > y[sortBy].length ? -1 : 1
}

const sortButton = document.getElementById("sort")
sortButton.onclick = () => {
	let words = getWords()

	clearWords()

	words = words.sort(sorting)

	loadWordsFromArray(words)
}

const openGlobalSettingsButton = document.getElementById("globalsettings")
const globalSettingsOverlay = document.getElementById("globalSettings")

const globalSettings = {
	fontSize: document.getElementById("fontsize"),
	themeSelector: document.getElementById("themeSelector")
}

openGlobalSettingsButton.onclick = () => {
	var fontsize = localStorage.getItem("fontsize") || "2vmin"
	globalSettings.fontSize.value = fontsize
	globalSettings.themeSelector.value = localStorage.getItem("theme") || "theme_default.css"
	globalSettingsOverlay.style.display = ""
	globalOverlay.style.display = ""
}


const cancelGlobalSettingsChangeButton = document.getElementById("cancelGlobalSettingsChange")
cancelGlobalSettingsChangeButton.addEventListener("click", () => {
	globalSettingsOverlay.style.display = "none"
	globalOverlay.style.display = "none"
})
const applyGlobalSettingsChangeButton = document.getElementById("applyGlobalSettingsChange")
applyGlobalSettingsChangeButton.onclick = () => {
	globalSettingsOverlay.style.display = "none"
	globalOverlay.style.display = "none"

	var fontsize = globalSettings.fontSize.value
	localStorage.setItem("fontsize", fontsize)
	setGlobalFontSize(fontsize)

	var t = globalSettings.themeSelector.value
	localStorage.setItem("theme", t)
	theme.href = t
}