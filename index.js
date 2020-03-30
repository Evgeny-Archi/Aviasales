const formSearch = document.querySelector(".form-search"),
	inputCitiesFrom = formSearch.querySelector(".input__cities-from"),
	dropdownCitiesFrom = formSearch.querySelector(".dropdown__cities-from"),
	inputCitiesTo = formSearch.querySelector(".input__cities-to"),
	dropdownCitiesTo = formSearch.querySelector(".dropdown__cities-to"),
	inputDateDepart = formSearch.querySelector(".input__date-depart"),
	cheapestTicket = document.getElementById("cheapest-ticket"),
	otherCheapTickets = document.getElementById("other-cheap-tickets");

const CITY_API = "cities.json",
	PROXY = "https://cors-anywhere.herokuapp.com/",
	API_KEY = "a9019235c3eb270f82f7d50ecf60329c",
  calendar = "http://min-prices.aviasales.ru/calendar_preload",
  MAX_COUNT = 10;

let city = [];

const getData = (url, callback) => {
	const request = new XMLHttpRequest();

	request.open("GET", url);

	request.addEventListener("readystatechange", () => {
		if (request.readyState !== 4) return;

		if (request.status === 200) {
			callback(request.response);
		} else {
			console.error(request.status);
		}
	});

	request.send();
};

// Создание и вывод выпадающего списка городов
const showDropdownCity = (input, list) => {
	list.textContent = "";

	if (!input.value) return; // Ничего не показываем, если в инпуте пусто

	const filterCity = city.filter(item => {
		item = item.name.toLowerCase();
		return item.startsWith(input.value.toLowerCase());
	});

	filterCity.forEach(item => {
		const li = document.createElement("li");
		li.classList.add("dropdown__city");
		li.textContent = item.name;
		list.append(li);
	});
};

const toggleInputValue = (event, dropdown, input) => {
	if (event.target.tagName.toLowerCase() === "li") {
		input.value = event.target.textContent;
		dropdown.textContent = "";
	}
};

// Формируем название города по его коду
const getNameCity = code => {
	const objCity = city.find(item => item.code === code);
	return objCity.name;
};

// Кол-во пересадок
const getChanges = num => {
	if (num) {
		return num === 1 ? "С одной пересадкой" : `Пересадок: ${num}`;
	} else {
		return "Без пересадок";
	}
};

// Формируем дату отправления в формате '00 месяц 2020 г., 00:00'
const getDate = date => {
  return new Date(date).toLocaleString('ru', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Формируем ссылку
const getLink = (data) => {
  let link = 'https://www.aviasales.ru/search/';
  link += data.origin;

  const date = new Date(data.depart_date);

  // Формируем день. Если он в формате 5, то добавляем ноль в начало
  const day = date.getDate();
  link += day < 10 ? '0' + day : day;

  const month = date.getMonth() + 1;
  link += month < 10 ? '0' + month : month;
  
  link += data.destination + '1';
  return link;
}

// Создаем карточку билета
const createCard = data => {
	const ticket = document.createElement("article"); // Создаем родителя для карточек билета
	ticket.classList.add("ticket");

	let deep = "";

	if (data) {
		deep = `
    <h3 class="agent">${data.gate}</h3>
	  <div class="ticket__wrapper">
	  	<div class="left-side">
	  		<a href="${getLink(data)}" class="button button__buy" target="_blank">Купить за ${data.value} Р.</a>
	  	</div>
	  	<div class="right-side">
	  		<div class="block-left">
	  			<div class="city__from">Вылет из города:
	  				<span class="city__name">${getNameCity(data.origin)}</span>
	  			</div>
	  			<div class="date">${getDate(data.depart_date)}</div>
	  		</div>
    
	  		<div class="block-right">
	  			<div class="changes">${getChanges(data.number_of_changes)}</div>
	  			<div class="city__to">Город назначения:
	  				<span class="city__name">${getNameCity(data.destination)}</span>
	  			</div>
	  		</div>
	  	</div>
	  </div>
    `;
	} else {
		deep = "<h3>На текущую дату билетов нет.</h3>";
	}

	ticket.insertAdjacentHTML("afterbegin", deep);

	return ticket;
};

// Показываем секцию с заголовком и добавляем в него карточку билета
const renderCheapDay = cheapTicket => {
  cheapestTicket.style.display = 'block';
  cheapestTicket.innerHTML = '<h2>Самый дешевый билет на выбранную дату</h2>';

	const ticket = createCard(cheapTicket[0]);
	cheapestTicket.append(ticket);
};

// Показываем секцию с заголовком и добавляем в него карточки билетов
const renderCheapYear = cheapTickets => {
  otherCheapTickets.style.display = 'block';
  otherCheapTickets.innerHTML = '<h2>Самые дешевые билеты на другие даты</h2>';

	cheapTickets.sort((a, b) => a.value - b.value);
	// тоже самое
	// cheapTickets.sort((a, b) => {
	//   if (a.value > b.value) {
	//     return 1;
	//   }
	//   if (a.value < b.value) {
	//     return -1;
	//   }
	//   return 0;
  // })
  for (let i = 0; i < cheapTickets.length && i < MAX_COUNT; i++) {
    const ticket = createCard(cheapTickets[i]);
    otherCheapTickets.append(ticket);
  }  
};

// Получаем билеты по дате и остальные
const renderCheap = (data, date) => {
	const cheapTickets = JSON.parse(data).best_prices;

	const cheapTicketDay = cheapTickets.filter(item => {
		return item.depart_date === date;
	});

	renderCheapDay(cheapTicketDay);
	renderCheapYear(cheapTickets);
};

// обработчики на инпут для выпадающего списка
inputCitiesFrom.addEventListener("input", () => {
	showDropdownCity(inputCitiesFrom, dropdownCitiesFrom);
});

inputCitiesTo.addEventListener("input", () => {
	showDropdownCity(inputCitiesTo, dropdownCitiesTo);
});

// Автозаполнение инпута при клике на город
dropdownCitiesFrom.addEventListener("click", event => {
	toggleInputValue(event, dropdownCitiesFrom, inputCitiesFrom);
});

dropdownCitiesTo.addEventListener("click", event => {
	toggleInputValue(event, dropdownCitiesTo, inputCitiesTo);
});

formSearch.addEventListener("submit", event => {
  event.preventDefault();  

	const cityFrom = city.find(item => inputCitiesFrom.value === item.name);

	const cityTo = city.find(item => inputCitiesTo.value === item.name);

	const formData = {
		from: cityFrom,
		to: cityTo,
		when: inputDateDepart.value
	};

	if (formData.from && formData.to) {
		const requestData = `?depart_date=${formData.when}&origin=${formData.from.code}&destination=${formData.to.code}&one_way=true&token=${API_KEY}`;

		getData(calendar + requestData, response => {
			renderCheap(response, formData.when);
		});
	} else {
		alert("Введите корректный город!");
	}
});

// Получение всех городов из API и запись их в массив city
getData(CITY_API, data => {
	city = JSON.parse(data).filter(item => item.name);
	city.sort((a, b) => {
		if (a.name > b.name) {
			return 1;
		}
		if (a.name < b.name) {
			return -1;
		}
		return 0;
	});
});

/*  тоже самое
  getData(CITY_API, (data) => {
    city = JSON.parse(data).filter(item => {
      return item.name
    });
  })
*/
