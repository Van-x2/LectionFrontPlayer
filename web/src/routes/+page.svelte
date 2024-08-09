<script>
  import { onMount } from 'svelte'

  //test
  //variables used for collecting data from input forms
    //Used for holding users username
    let usernameField = ''
    let username = ''
    let userID = ''
    //Used to hold the current joincode
    let joincodeField = ''
    let joincode = ''
    //Used to hold the current response to the prompt
    let promptResponse
    let promptResponseField
    let currentPrompt = 0
    //
    let confidenceField = 3
    let confidence = 3

    let statusTextColor = 'text-primary'


  //temp variables, will be replaced with actual staged user inputs
  let answerField = ''
  let confidenceValue = 3
  let menuOpen = false

  //page elements
  let menuCard
  let menuIcon
  let mountedDocument
  let usernameInputCard
  let usernameInputCardParent
  let statusText
  let lobbyJoinCard
  let lobbyPreStartCard
  let promptContent
  let ResponseSubmittedCard
  let contentWindow

  
  onMount(() => {
  //so the user cannot scroll the page
  //document.body.style.overflow = 'hidden'
  document.body.style.touchAction = 'none'
  document.body.style.position = 'fixed'



  //variable used to reference the document outside of onMount()
  mountedDocument = document
  menuCard = document.getElementById('menu')
  menuIcon = document.getElementById('menuIcon')
  usernameInputCard = document.getElementById('usernameInputCard')
  usernameInputCardParent = document.getElementById('usernameInputCardParent')
  statusText = document.getElementById('statusText')
  lobbyJoinCard = document.getElementById('lobbyJoinCard')
  lobbyPreStartCard = document.getElementById('lobbyPreStartCard')
  promptContent = document.getElementById('promptContent')
  ResponseSubmittedCard = document.getElementById('ResponseSubmittedCard')
  contentWindow = document.getElementById('window')
  
  loadPossibleUsername()
  })

  //check if client is desktop or mobile
  function isMobile() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  
  // Check for mobile devices
  if (/android/i.test(userAgent)) {
    return true;
  }
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    return true;
  }
  return false;
  }
  /*
  //opens the webpage in a seperate window (for desktop users only)
  function openNewWindow() {
    contentWindow.classList.add('opacity-0')
      const url = 'http://127.0.0.1:5315/';
      const windowFeatures = 'width=350,height=600,right=50,top=300,toolbar=no,menubar=no,resizable=no,status=no';
      window.open(url, '_blank', windowFeatures);
  
  }
*/

//For communicating with backend
  //handles majoriy of the backend communication
  function joinLobby(localJoincode) {
    //error handling
    let errorPassed = false

    //formatting username to lowercase
    let usernameLower = username.toLocaleLowerCase()
    //defines JSON data to be sent to backend
    let bodyContent = {
      name: username,
      joincode: localJoincode,
      userid: userID
    }
    //sends JSON data to the backend adding the client to the participants field
    fetch(`https://lection-backend.fly.dev/joinlobby${localJoincode}`, 
  {
      method: "POST", 
      body: JSON.stringify(bodyContent),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    //error checking response
    .then( async (response) => {
      if (!response.ok) {
        errorPassed = true
        setStatusText("PIN not recognized", 'text-red-800')
        setTimeout(() => {
        setStatusText()
        },1700)
        throw new Error(`Unable to find a lobby using the submitted lobby joincode`)
      }
      const data = await response.json();
      if (data.joined === false) {
        errorPassed = true
        setStatusText("Cannot join an active Lectionary", 'text-red-800')
        setTimeout(() => {
        setStatusText()
        },1700)
        throw new Error(`Unable to join a lobby that is currently running`)
      }
      console.log(data)
      return response
    })
    //begins SSE connection with lobbyClientCom()
    .then(() => {
      console.log('request received')
      setStatusText("Joining lectionary")
      setTimeout(() => {
        setStatusText()
        },1000)
        enterLobby()
        lobbyClientCom()
    })
    .catch(error => {
      if (!errorPassed) {
        console.error(error)
        setStatusText("Server not responding", 'text-red-800')
        setTimeout(() => {
        setStatusText()
        },3000)
      }
    })
    setStatusText("Searching...")

    let oldPrompts
    let currentPrompts

    //Starts listening to SSE from the backend to update prompts
    async function lobbyClientCom() {
      const source = new EventSource(`https://lection-backend.fly.dev/lobbyclient${joincodeField}${username}${userID}`)

      source.addEventListener('message', message => {
        let response = JSON.parse(message.data)

        currentPrompts = response.prompts

        console.log(response)
        if(response.prompts.length === 1) {
          startLobby(currentPrompts)
        }
        if(response.status === 3) {
          source.close()
          leaveLobby()
        }
        if(currentPrompts != oldPrompts) {
          updatePromptPage(currentPrompts)
        }
        oldPrompts = currentPrompts
      })
    }

  }
  
  //to leave the lobby (not done)
  function leaveLobby() {
    console.log('left the lobby')
    location.reload();
  }
  //handles submitting data back to the database
  function submitResponse() {
    promptResponse = promptResponseField
    confidence = confidenceValue

    let asnwerContent = {
      response: promptResponse,
      confidence: confidence,
      promptIndex: currentPrompt
    }
  //submit asnwer to mongodb
    fetch(`https://lection-backend.fly.dev/clientsubmitresponse${joincodeField}${username}${userID}`, 
  {
      method: "POST", 
      body: JSON.stringify(asnwerContent),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    //error checking response
    .then( response => {
      if (!response.ok) {
        throw new Error(`There was an error: ${response.status}`)
      }
      return response
    })
    .then(console.log('submitted response'))
    .catch(error => console.error(error))

    ResponseSubmittedCard.classList.add('opacity-75')
    ResponseSubmittedCard.classList.remove('opacity-0')
    ResponseSubmittedCard.classList.add('pointer-events-auto')

    currentPrompt = currentPrompt + 1
  }

//for listing to page actions
  function menuIconClicked() {
    if(!menuOpen) {
      menuIcon.classList.add('-rotate-90')
      menuCard.classList.remove('-translate-y-40')
      menuOpen = true
    }
    else if(menuOpen) {
      menuIcon.classList.remove('-rotate-90')
      menuCard.classList.add('-translate-y-40')
      menuOpen = false
    }
  }
  function joincodeSubmit() {
    joincode = joincodeField
    joinLobby(joincode)
  }

//for updating page data
  //function to load username from cookie
  function loadPossibleUsername() {
    if(mountedDocument.cookie) {
      let cookieUsername = getCookie('username')
      let cookieUserID = getCookie('userID')
      usernameInputCard.classList.add('translate-y-[1000px]')
      usernameInputCardParent.classList.add('pointer-events-none')
      userID = cookieUserID
      username = cookieUsername
      usernameField = cookieUsername
      console.log(userID)
    }
  }
  function getCookie(name) {
    const value = `; ${mountedDocument.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}
  //function to add username to temp storage and to the cookie
  function submitUsername() {
    //defines permanent username using the temp usernameField var
    username = usernameField.trim()
    userID = generateID()


    //Adds username to the cookie & makes sure it wont expire for a long LONG time
    const farFutureDate = new Date()
    farFutureDate.setFullYear(farFutureDate.getFullYear() + 100); // Setting the expiry date 100 years in the future
    document.cookie = `username=${username}; expires=${farFutureDate.toUTCString()}; path=/`
    document.cookie = `userID=${userID}; expires=${farFutureDate.toUTCString()}; path=/`

    //slides the card out of view
    usernameInputCard.classList.add('translate-y-[1000px]')
    usernameInputCardParent.classList.add('pointer-events-none')
  }
  //function to clear the username from the cookie and temp storage
  function clearUsername() {
    menuIconClicked()
    //clears the username var
    username = ''
    userID = ''

    //clears username cookie
    document.cookie = 'username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/'
    document.cookie = 'userID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/'

    //slides card back into view
    usernameInputCard.classList.remove('translate-y-[1000px]')
    usernameInputCardParent.classList.remove('pointer-events-none')
  }
  //generates the userID
  function generateID() {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  //function to change the status text near the PIN input area
  function setStatusText(string = '', color = 'text-primary') {
    if(string === '') {

      statusText.classList.add('opacity-0')
      setTimeout(() => {
        statusText.classList.remove('animate-pulse')

        setTimeout(() =>{
        statusText.classList.add(color)
        statusText.classList.remove(statusTextColor)
        statusTextColor = color
      }, 300)

      },300)
    }
    else {
      //manages the color of the text
      statusText.classList.add(color)
      statusText.classList.remove(statusTextColor)
      statusTextColor = color

      statusText.innerText = string
      statusText.classList.remove('opacity-0')
      statusText.classList.add('animate-pulse')
    }
  }
  //postEnterLobby phase
  function enterLobby() {
  console.log('Lobby joined')
  lobbyJoinCard.classList.add('opacity-0')
  lobbyJoinCard.classList.add('pointer-events-none')
  }

  function startLobby() {
  console.log('Lobby started')
  lobbyPreStartCard.classList.add('opacity-0')
  lobbyPreStartCard.classList.add('pointer-events-none')
  }

  function updatePromptPage(prompts) {
    ResponseSubmittedCard.classList.remove('opacity-75')
    ResponseSubmittedCard.classList.add('opacity-0')
    ResponseSubmittedCard.classList.add('pointer-events-none')
    ResponseSubmittedCard.classList.remove('pointer-events-auto')

    promptResponseField = ''
    confidenceValue = 3
    const currentPromptContent = prompts[currentPrompt]
    promptContent.innerText = currentPromptContent
  }


</script>

<div id="window" class="w-screen h-[100svh] bg-gray1 select-none absolute">
  <div class="w-full h-full flex flex-col items-center">
    <div id="topWrapper" class=" w-full h-[190px] relative z-20">
      <div id="nav" class="w-full h-16 relative bg-white shadow-lg z-10">
        <div class="w-full h-full flex relative">
          <div class="h-16 w-16 bg-primary flex items-center justify-center">
            <span class=" text-white text-[50px] font-title font-bold italic absolute">L</span>
            <div class="w-full h-full relative">
              <div class="w-4 h-4 absolute bottom-[4px] right-[4px]">
                <div class="w-full h-full relative">
                  <div class="w-[4px] h-[13px] bg-white absolute bottom-0 right-0"></div>
                  <div class="w-[13px] h-[4px] bg-white absolute bottom-0 right-0"></div>
                </div>
              </div>
            </div>
          </div>
          <div class="h-16 w-fit p-4 pl-4">
            <div class="w-full h-full flex items-center">
              <p class=" text-primary font-title font-bold italic text-[27px]">
              {username}
              </p>
            </div>
          </div>
          <div class="h-16 w-16 bg-white right-0 absolute">
            <div class="w-full h-full">
              <div id="menuIcon" class="w-full h-full flex items-center justify-center transition-all duration-300">
                <button on:click={menuIconClicked}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="size-10 fill-neutral-800 stroke-neutral-800 stroke-[0.8px]">
                    <path d="M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75ZM3 12a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm0 5.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z" clip-rule="evenodd" />
                  </svg>
                </button>     
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="menu" class="w-full h-[115px] flex justify-center z-9  transition-all -translate-y-40 duration-300 absolute">
        <div class="md:w-[400px] w-full h-full bg-gray2 border-b-[4px] border-x-[4px] border-neutral-800 rounded-br-[25px] rounded-bl-[25px] px-[8px] py-[7px]">
          <div class="w-full h-full font-normal font-semibold text-[13px] relative">
            <button class="w-full h-[45%]" on:click={clearUsername}>
              <div class="w-full h-full bg-neutral-800 rounded-[13px] flex text-white justify-center items-center">
                <span>Reset Username</span>
              </div>
            </button>
            <button class="w-full h-[45%] mt-2" on:click={leaveLobby}>
              <div class="w-full h-full bg-secondary rounded-[13px] flex text-neutral-800 justify-center items-center shadow-inner">
                <span>Leave the Lectionary</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
    <div id="bottomWrapper" class="flex-grow w-full lg:w-1/2 md:w-3/4 sm:w-full relative z-10 bg-green-300 flex">
      <div class="h-full w-full">
        <div class="w-full h-full">
          <div class="w-full h-full relative">
            <div id="usernameInputCardParent" class="w-full h-full absolute z-50">
              <div id="usernameInputCard" class="relative w-full h-full transition duration-[800ms] ">
                <div class="w-full h-full bg-gray2 rounded-tr-[40px] rounded-tl-[40px] border-[2px] border-accent">
                  <div class="w-full h-2/3">
                    <div class="w-full h-[45%] ">
                      <div class="w-full h-full flex justify-center items-center">
                        <p class=" font-title font-bold italic text-[60px] translate-x-[2px] absolute z-20 bg-gradient-to-r from-cyan-800 to-sky-900 bg-clip-text text-transparent">
                          Lection
                        </p>
                      </div>
                    </div>
                    <div class="w-full h-[55%] flex justify-center">
                      <div class="w-[90%] h-[90%] ">
                        <div class="w-full h-full bg-white rounded-[20px]  border-secondary border-[2.5px] shadow-xl py-[8px] px-[14px]">
                          <div class="w-full h-full flex flex-col">
                            <div class="w-[100] h-[44%] rounded-[10px] mb-2 mt-[7px]">
                              <input 
                                type="text" 
                                class="w-full h-full text-[18px] font-normal border-2 border-accent focus:border-[4px] text-accent text-center rounded-[10px] focus:outline-none transition-all duration-75" 
                                placeholder="Username"
                                bind:value={usernameField}
                              >
                            </div>
                            <button class="w-[100%] h-[44%] group mb-2 active:translate-y-[2px] transition duration-75" on:click={submitUsername}>
                              <div class="w-full h-full rounded-[10px] bg-neutral-800 group-active:bg-neutral-900 transition duration-75 mb-2 ">
                                <div class="w-full h-full flex items-center justify-center text-white text-[18px] font-normal">
                                  <p>
                                    Enter
                                  </p>
                                </div>
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="w-full h-1/3 relative text-neutral-800">
                    <div class="w-full h-[120px] bottom-0 absolute">
                      <div class="w-full h-[80%] ">
                        <div class="w-full h-full flex justify-center items-end">
                          <div class="w-2/3 h-[50%]">
                            <p class="  font-normal text-[14px] text-center">
                              Create your own Lectionary for FREE at 
                              <span class="font-semibold ">
                                <a href="http://lection.cc/" target="_blank">
                                  Lection.cc
                                </a>
                              </span> 
                            </p>
                          </div>
                        </div>
                      </div>
                      <div class="w-full h-[20%] flex font-normal font-semibold text-[14px]">
                        <div class="w-1/3 h-full text-left pl-4">
                          <button>
                            Terms
                          </button>
                        </div>
                        <div class="w-1/3 h-full text-center">
                          <button>
                            Privacy
                          </button>
                        </div>
                        <div class="w-1/3 h-full  text-right pr-4">
                          <button>
                            Cookies
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="w-full h-full absolute">
              <div id="OtherScreens" class=" w-full h-full relative">
                <div id="lobbyJoinCard" class="w-full h-full flex flex-col justify-end absolute z-40 bg-gray1 transition-all duration-300">
                  <div class="w-full h-[25%] ">
                    <div class="w-full h-full flex justify-center items-center">
                      <p class="text-center w-[70%] text-[18px] text-neutral-800 font-normal font-semibold">
                        Join a lectionary using an educator-provided PIN.
                      </p>
                    </div>
                  </div>
                  <div class="w-full h-[60%] ">
                    <div class="w-full h-[60%] flex justify-center items-center">
                      <div class="w-[90%] h-[90%]">
                        <div class="w-full h-full bg-white rounded-[20px]  border-secondary border-[2.5px] shadow-xl py-[8px] px-[14px]">
                          <div class="w-full h-full flex flex-col">
                            <div class="w-[100] h-[44%] rounded-[10px] mb-2 mt-[7px]">
                              <input 
                                type="text"
                                inputmode="decimal" 
                                class="w-full h-full text-[18px] font-normal border-2 border-accent focus:border-[4px] text-accent text-center rounded-[10px] focus:outline-none transition-all duration-75" 
                                placeholder="Lectionary PIN"
                                bind:value={joincodeField}
                              >
                            </div>
                            <button class="w-[100%] h-[44%] group mb-2 active:translate-y-[2px] transition duration-75" on:click={joincodeSubmit}>
                              <div class="w-full h-full rounded-[10px] bg-neutral-800 group-active:bg-neutral-900 transition duration-75 mb-2 ">
                                <div class="w-full h-full flex items-center justify-center text-white text-[18px] font-normal">
                                  <p>
                                    Enter
                                  </p>
                                </div>
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="w-full h-[40%] flex flex-col justify-start items-center pt-2 ">
                      <p id="statusText" class="text-center w-2/3 font-normal text-primary text-[18px] font-semibold transition-all duration-500 opacity-0">
                        This is some status text
                      </p>
                    </div>
                  </div>
                  <div class="w-full h-[15%] flex justify-center items-center">
                    <p class="w-2/3 text-center text-[14px] font-normal text-neutral-800">
                      Create your own Lectionary for FREE at
                      <span class="font-bold">
                        <a href="http://lection.cc/" target="_blank">
                          Lection.cc
                        </a>
                      </span>  
                    </p>
                  </div>
                </div>
                <div id="lobbyPreStartCard" class="w-full h-full flex flex-col justify-end absolute z-30 bg-gray1 transition-all duration-300">
                  <div class="w-full h-[60%]">
                    <div class="w-full h-full flex justify-center items-center">
                      <div class="w-[90%] h-fit p-8 flex justify-center items-center bg-white rounded-[20px] border-2 border-secondary shadow-xl">
                        <p class="text-center w-[90%] text-[18px] text-neutral-800 font-normal font-semibold ">
                          Joined the Lectionary
                          <br>
                          <br>
                          Waiting for the educator to begin...
                        </p>
                      </div>
                    </div>
                  </div>
                  <div class="w-full h-[25%] ">
                  </div>
                  <div class="w-full h-[15%] flex justify-center items-center">
                    <p class="w-2/3 text-center text-[14px] font-normal text-neutral-800">
                      Create your own Lectionary for FREE at
                      <span class="font-bold pointer-events-auto">
                        <a href="http://lection.cc/" target="_blank">
                          Lection.cc
                        </a>
                      </span>  
                    </p>
                  </div>
                </div>
                <div id="ResponseSubmittedCard" class="w-full h-full flex justify-center items-center absolute z-20 bg-gray1 transition-all duration-300 opacity-0 pointer-events-none">
                  <div class="w-full h-full flex justify-center items-center">
                    <p class="text-center w-[70%] text-[18px] text-neutral-800 font-normal font-semibold">
                      Response Submitted
                    </p>
                  </div>
                </div>
                <div id="lobbyHappeningCard" class="w-full h-full flex flex-col justify-start absolute z-10 bg-gray1 transition-all duration-300">
                  <div class="w-full h-[95%]">
                    <div class="w-full h-full flex justify-center items-center">
                      <div class="w-[90%] h-[100%]">
                        <div class="w-full h-full bg-white rounded-[20px]  border-secondary border-[2.5px] shadow-xl py-[12px] px-[12px]">
                          <div class="w-full h-full flex flex-col p-[5px]">
                            <div class="w-full h-[65%]">
                              <div class="w-full h-1/3  flex items-center justify-center  flex-col pb-4">
                                <div class="w-full h-1/2 font-normal text-[20px] font-semibold -translate-x-[3px] -translate-y-[8px] text-secondary">
                                  {currentPrompt + 1}
                                </div>
                                <div class="w-full h-1/2 flex justify-center">
                                  <p id="promptContent" class="w-[85%] h-full text-neutral-800 text-[14px] font-normal font-semibold text-center  -translate-y-[20px]">
                                    This is a mockup prompt, what do you think, what are your thoughts?
                                  </p>
                                </div>
                              </div>
                              <div class="w-full h-2/3 pb-2">
                              <div class="w-full h-full">
                                <textarea 
                                class="w-full h-full text-[14px] font-normal border-2 border-accent focus:border-[4px] text-accent rounded-[10px] focus:outline-none transition-all duration-75 p-2" 
                                placeholder="Enter response here"
                                bind:value={promptResponseField}
                              />
                              </div>
                              </div>
                            </div>
                            <div class="w-full h-[35%]">
                              <div class="w-full h-[68%]">
                                <div class="w-full h-[50%]">
                                  <p class=" text-neutral-700 text-center text-[13px] font-normal font-semibold">How confident are you in this response?</p>
                                  <p class=" text-accent text-center text-[18px] font-normal font-semibold">{confidenceValue}/5</p>
                                </div>
                                <div class="w-full h-[50%] ">
                                  <div class="w-full h-full flex justify-center items-center">
                                    <input id="confidenceSlider" class="w-[90%]" type="range" step="1" min="1" max="5" bind:value={confidenceValue}>
                                  </div>
                                </div>
                              </div>
                              <div class="w-full h-[32%] ">
                                <button class="w-[100%] h-[100%] group mb-2 active:translate-y-[2px] transition duration-75" on:click={submitResponse}>
                                  <div class="w-full h-full rounded-[10px] bg-neutral-800 group-active:bg-neutral-900 transition duration-75 mb-2 translate-y-[7px]">
                                    <div class="w-full h-full flex items-center justify-center text-white text-[14px] font-normal">
                                      <p>
                                        Enter
                                      </p>
                                    </div>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
    
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
</div>

<style lang="postcss">

  input {
    -webkit-appearance: none;
    -moz-appearance: textfield;
  }

  #confidenceSlider {
  -webkit-appearance: none;
  width: 90%;
  height: 8px;
  border-radius: 5px;  
  background: #99B2BD;
  outline: none;
  opacity: 100;
  -webkit-transition: .2s;
  transition: opacity .2s;
}

#confidenceSlider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 17px;
  height: 30px;
  border-radius: 20%;
  background: #353535;
  cursor: pointer;
  border: 0cm;
}

#confidenceSlider::-moz-range-thumb {
  width: 17px;
  height: 30px;
  border-radius: 20%;
  background: #353535;
  cursor: pointer;
  border: 0cm;
}
</style>
