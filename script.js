const form_input = document.querySelector(".input");

const autocomplete = document.getElementById('autocomplete');

const elements = document.querySelector('.elements');

const repository_template = document.getElementById('repository-template').content;

const rep_elem = repository_template.querySelector('.rep-elem');

const preloader = document.querySelector(".preloader");

const getDelay = 500;

let controller = new AbortController();

let signal = controller.signal;

let reposMap;

//localStorage.clear();



if (localStorage.getItem("repositories")){

  reposMap = new Map(Object.entries(JSON.parse(localStorage.getItem("repositories"))));

  for (let repository of reposMap) {

    renderCard(repository[1], repository[0]);

  }

} else {

  reposMap = new Map();

}



searchRepository.oninput = async (event) => {

  event.preventDefault();

  //controller.abort();

  clearAutocomplete();
  addSpiner();

  preloader.classList.add("visible");

  

  if (searchRepository.name.value.length) {

    try {

      const response = await debounceGetData(searchRepository.name.value).then(res => res());

      const responseJson = await response.json();

      preloader.classList.remove("visible");

      clearAutocomplete();

      for (let i = 0; i < 5; i++) {

        const optionName = responseJson["items"][i];

        const option = document.createElement("p");

        option.classList.add("option");

        option.addEventListener("click", addOptionListener.bind(this, optionName));

        postAutocomplete(option, optionName["full_name"]);

      }

    } catch(err) {

        console.log(err);

        const option = document.createElement("p");

        if (err.message.includes("full_name")) {

          postAutocomplete(option, "такого репозитория нет");

        }

    };

  } else {

    clearAutocomplete();

  }

  preloader.classList.remove("visible");

};





//======== functions =========



async function getData(val) {

  try {

    return await fetch(`https://api.github.com/search/repositories?q=${val}`, 

      { method: 'GET', 

        signal: controller.signal,

      });

  } catch {}

};



const debounce = (fn, delay) => {

  let timerId;

  return function(...args) {

    if (timerId) clearTimeout(timerId);

    return new Promise(resolve => {

      let delayFn = fn.bind(this, ...args);

      timerId = setTimeout(() => resolve(delayFn), delay);

    });

  }

};



const debounceGetData = debounce(getData, getDelay);



function renderCard(value, repName) {

  let clone = rep_elem.cloneNode(true);

  clone.children[0].textContent = value["name"];



  if (!value["owner"]) clone.children[1].textContent = value["login"];

  else clone.children[1].textContent = value["owner"]["login"];



  clone.children[2].textContent += value["stargazers_count"];

  let closeCross = clone.querySelector(".close");



  closeCross.addEventListener("click", () => {

    reposMap.delete(repName);

    writeToStorage(reposMap);

    clone.remove();

  });

  elements.appendChild(clone);

}



function clearAutocomplete() {

  while(autocomplete.firstChild){

    autocomplete.removeChild(autocomplete.firstChild);

  }

}



function writeToStorage(data) {

  const map2obj = Object.fromEntries(data);

  const obj2json = JSON.stringify(map2obj);

  localStorage.setItem("repositories", obj2json);

}



function postAutocomplete(option, content) {

  option.textContent = content;

  autocomplete.appendChild(option);

}



function addOptionListener(option) {

  const reposContent = {"name": option["name"],

                        "login": option["owner"]["login"],

                        "stargazers_count": option["stargazers_count"],

                       };



  const reposMapSize = reposMap.size;

  reposMap.set(option["full_name"], reposContent);

  writeToStorage(reposMap, option["full_name"]);



  if (reposMapSize !== reposMap.size) {

    renderCard(option, option["full_name"]);

  }

  form_input.value = '';

}

function addSpiner() {
  const spiner = document.createElement("img");
  spiner.src = "./pics/spiner.svg";
  spiner.classList.add("spiner");
  autocomplete.appendChild(spiner);
}
