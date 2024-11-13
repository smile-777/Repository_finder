let response, responseJson, timerId;
const form_input = document.querySelector(".input");
const autocomplete = document.getElementById('autocomplete');
const elements = document.querySelector('.elements');
const repository_template = document.getElementById('repository-template').content;
const rep_elem = repository_template.querySelector('.rep-elem');
const getDelay = 700;
//let nowTime;

searchRepository.oninput = async (event) => {
  event.preventDefault();
  //nowTime = Date.now();
  
  if (searchRepository.name.value.length) {
    try {
      let debounceGetData = getData.bind(this, searchRepository.name.value);
      await debounce(debounceGetData, getDelay).then(res => res());
      responseJson = await response.json();
    
      while(autocomplete.firstChild){
        autocomplete.removeChild(autocomplete.firstChild);
      }

      if (responseJson && searchRepository.name.value.length) {
        for (let i = 0; i < 5; i++) {
          const option = document.createElement("p");
          option.classList.add("option");
          option.textContent = responseJson["items"][i]["full_name"];
          option.addEventListener("click", function() {
            let clone = rep_elem.cloneNode(true);
            clone.children[0].textContent = responseJson["items"][i]["name"];
            clone.children[1].textContent = responseJson["items"][i]["owner"]["login"];
            clone.children[2].textContent += responseJson["items"][i]["stargazers_count"];
            let closeCross = clone.querySelector(".close");
            closeCross.addEventListener("click", () => clone.remove(), { once: true });
            elements.appendChild(clone);
            form_input.value = '';
            while(autocomplete.firstChild){
              autocomplete.removeChild(autocomplete.firstChild);
            }
          });
          autocomplete.appendChild(option);
        }
      }
    } catch(err) {
        const option = document.createElement("p");
        option.textContent = "такого репозитория нет";
        autocomplete.appendChild(option);
    };
  } else {
      while(autocomplete.firstChild){
      autocomplete.removeChild(autocomplete.firstChild);
    }
  }
}

async function getData(val) {
  response = await fetch(`https://api.github.com/search/repositories?q=${val}`, 
    { method: 'GET', });
  //alert(Date.now() - nowTime);
};

const debounce = (fn, delay) => {
      if (timerId) clearTimeout(timerId);
      return new Promise(resolve => {
        timerId = setTimeout(() => resolve(fn), delay);
      });
};
