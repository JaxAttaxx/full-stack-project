/* Start Function Definitions */
/**
 * Gets the HTML for a single role List Item and returns it
 * @param {object} roleData Object of role data. Expects the object to have an `id` property and a `role` property
 * @returns {string} The HTML string for that role list item
 */
function getRoleHtml(roleData) {
  const html = `

        <li class="role-item js-role-item d-flex justify-content-center" data-id="${roleData.id}">
        <div class="role-form d-flex playerdiv">

        <p>Role: ${roleData.role} <br> 
        Name: ${roleData.name}<br>
        Email: ${roleData.email}<br> 
        Phone: ${roleData.phone}</p>
        
        <button class="todo-button delete js-delete-button" data-id="${roleData.id}" style='background-color:#F6AA1C' type="button">Drop This Player</button>
        </div>
        <br>
        </li>
        `;
  // <button class="role-button delete js-delete-button" data-id="${roleData.id}" type="button">X</button>
  // <input class="check-button" type="checkbox" ${roleData.complete ? 'checked': ''} data-id="${roleData.id}">

  return html;
}

function getPlayerHtml(playerData, teamId) {
  const html = `
  <li>Name: ${playerData.name}, Role: ${playerData.role}<button style='background-color:#F6AA1C' onclick='addPlayerToTeam(${playerData.id}, ${teamId})'>+add me!</button></li>
  `
  return html
}

function getPlayerForTeamsHtml(playerData, teamId) {
  const html = `<li style='font-size:18px'>Name: ${playerData.name}, Role: ${playerData.role}<button style='background-color:#F6AA1C; margin-left:4px' onclick='removePlayerFromTeam(${playerData.id}, ${teamId})'>remove player!</button></li>`
  return html
}

function removePlayerFromTeam(playerId, teamId) {
  axios.delete(`/teamplayers?playerId=${playerId}&teamId=${teamId}`).then(renderPlayers())
    .catch((error) => {
      console.log(error);
    })
}


function getTeamHtml(teamData) {
  const html = `
        <li class='team-item js-team-item'  data-id='${teamData.id}'>
        <div class='role-form teams'>
      
        <h3>${teamData.teamName}</h3>
        <button class='btn' onclick="deleteteam(${teamData.id})">Delete This Team</button>
        <button class='btn' style='background-color:#F6AA1C'; type='button' data-toggle='collapse'
        data-target='#teamData-${teamData.id}' aria-expanded='false' aria-controls='teamData'>show teammembers</button>
        
        <div class='collapse' id='teamData-${teamData.id}'>

        <div class='card card-body bac'>
        
        <ul class="playerList" style="list-style:none" id="playerList-${teamData.id}" data-id="${teamData.id}">No players yet!</ul>
        
        <ul id="playerSearchResults-${teamData.id}" data-id="${teamData.id}"></ul>
        
        <label for="playerName-${teamData.id}">Add Player:</label>
        <input style="color: black" type="text" id="playerName-${teamData.id}" name="playerName-${teamData.id}"><br>
        
        <button style="background-color: #F6AA1C" onclick="searchPlayers(${teamData.id})">Search!</button>
            
        </div>
        </div></li>
        `;
  // <button class='role-button delete js-delete-button' data-id="${roleData.id}" type="button">X</button>
  // <input class="check-button" type="checkbox" ${roleData.complete ? 'checked': ''} data-id="${roleData.id}">

  return html;
}

function searchPlayers(teamId) {
  const player = document.getElementById(`playerName-${teamId}`).value
  const uriPlayer = encodeURIComponent(player)
  axios.get(`/players?playerName=${uriPlayer}`).then((response) => {
      const htmlArray = response.data.map((playerItem) => {
        return getPlayerHtml(playerItem, teamId);
      });
      const htmlString = htmlArray.join('');
      const players = document.querySelector(`#playerSearchResults-${teamId}`)
      players.innerHTML = htmlString
    })
    .catch((error) => {
      console.log(error);
    });
}

function renderPlayers() {
  document.querySelectorAll(".playerList").forEach(element => {
    axios.get(`/team/${element.getAttribute("data-id")}/players`).then((response) => {
        const htmlArray = response.data.map((playerItem) => {
          return getPlayerForTeamsHtml(playerItem, element.getAttribute("data-id"));
        });
        const htmlString = htmlArray.join('');
        // lol this looks straight stupid. the idea is that the weird value below is a number which represents an id tag. Let's see if it works
        const players = document.querySelector(`#playerList-${element.getAttribute("data-id")}`);
        players.innerHTML = htmlString;

      })
      .catch((error) => {
        console.log(error);
      });
  });
}

function addPlayerToTeam(playerId, teamId) {
  axios.post(`/teamplayers?playerId=${playerId}&teamId=${teamId}`).then(() => {
      renderPlayers()
      document.getElementById(`playerSearchResults-${teamId}`).innerHTML = '';
      document.getElementById(`playerName-${teamId}`).value = '';
    })
    .catch((error) => {
      console.log(error);
    })
}

function renderRoles() {
  axios
    .get('/roles')
    .then((response) => {
      const htmlArray = response.data.map((roleItem) => {
        return getRoleHtml(roleItem);
      });
      const htmlString = htmlArray.join('');
      const roles = document.querySelector('.roles-go-here');
      roles.innerHTML = htmlString;
    })
    .catch((error) => {
      console.log(error);
    });
}

function renderTeams() {
  axios
    .get('/teams')
    .then((response) => {
      const htmlArray = response.data.map((teamItem) => {
        return getTeamHtml(teamItem);
      });
      const htmlString = htmlArray.join('');
      const teams = document.querySelector('.teams-go-here');
      teams.innerHTML = htmlString;
      renderPlayers()
    })
    .catch((error) => {
      console.log(error);
    });
}

function deleterole(id) {
  axios
    .delete(`/roles/${id}`)
    .then((response) => {
      renderRoles()
    })
    .catch((error) => {

      const errorText = error.response.data.error || error;

      alert('could not delete role:' + errorText);
    });
}

function deleteteam(id) {
  axios.delete(`/teams/${id}`)
    .then((resizedteamlist) => {
      renderTeams();
    })
    .catch((error) => {
      const errorText = error.response.data.error || error;
      alert('could not delete team:' + errorText);
    });
}

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('js-delete-button')) {
    const id = e.target.dataset.id;
    deleterole(id);
  }

});
renderRoles();
renderTeams();