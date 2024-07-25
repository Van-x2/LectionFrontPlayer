<script>
  import { onMount } from 'svelte'
  import { scale } from 'svelte/transition';

  //variables used for collecting data from input forms
    //Used for holding users username
    let usernameField = ''
    let username = ''
    //Used to hold the current joincode
    let joincodeField = ''
    let joincode = ''

  //temp variables, will be replaced with actual staged user input
  let currentprompt = 0
  let answerField = ''
  let confidenceValue = '3'
  let menuOpen = false

  //page elements
  let menuCard
  let menuIcon
  let mountedDocument
  let usernameInputCard
  let usernameInputCardParent

  
  onMount(() => {
  //so the user cannot scroll the page
  document.body.style.overflow = 'hidden'
  document.body.style.touchAction = 'none'



  //variable used to reference the document outside of onMount()
  mountedDocument = document
  menuCard = document.getElementById('menu')
  menuIcon = document.getElementById('menuIcon')
  usernameInputCard = document.getElementById('usernameInputCard')
  usernameInputCardParent = document.getElementById('usernameInputCardParent')
  
  loadPossibleUsername()
  })

  //handles majoriy of the backend communication
  function joinLobby() {
    
    //defines JSON data to be sent to backend
    let bodyContent = {
      name: nameField,
      joincode: joincodeField
    }
    //sends JSON data to the backend adding the client to the participants field
    fetch(`http://localhost:5313/joinlobby${joincodeField}`, 
  {
      method: "POST", 
      body: JSON.stringify(bodyContent),
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
    //begins SSE connection with lobbyClientCom()
    .then(() => {
      lobbyClientCom()
    })

    //Starts listening to SSE from the backend to update prompts
    async function lobbyClientCom() {
      const source = new EventSource(`http://localhost:5313/lobbyclient${joincodeField}${nameField}`)
      source.addEventListener('message', message => {
        let response = JSON.parse(message.data)
        console.log(response)
        if(response.status === 3) {
          source.close()
          leaveLobby()
        }
      })
    }

    async function submitClientResponse() {}
  }
  //to leave the lobby (not done)
  function leaveLobby() {
    console.log('left the lobby')
  }
  //handles submitting data back to the database
  function submitResponse() {
    let asnwerContent = {
      response: answerField,
      confidence: confidenceValue,
      promptIndex: currentprompt
    }
  //submit asnwer to mongodb
    fetch(`http://localhost:5313/clientsubmitresponse${joincodeField}${nameField}`, 
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
  }

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

  //function to load username from cookie
  function loadPossibleUsername() {
    if(mountedDocument.cookie) {
      let cookieUsername = mountedDocument.cookie.split('=')[1]
      usernameInputCard.classList.add('translate-y-[700px]')
      usernameInputCardParent.classList.add('pointer-events-none')
      username = cookieUsername
      usernameField = cookieUsername
      
    }
  }

  function submitUsername() {
    //defines permanent username using the temp usernameField var
    username = usernameField


    //Adds username to the cookie & makes sure it wont expire for a long LONG time
    const farFutureDate = new Date()
    farFutureDate.setFullYear(farFutureDate.getFullYear() + 100); // Setting the expiry date 100 years in the future
    document.cookie = `username=${username}; expires=${farFutureDate.toUTCString()}; path=/`

    //slides the card out of view
    usernameInputCard.classList.add('translate-y-[700px]')
    usernameInputCardParent.classList.add('pointer-events-none')
  }

  function clearUsername() {
    menuIconClicked()
    //clears the username var
    username = ''

    //clears username cookie
    document.cookie = 'username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/'

    //slides card back into view
    usernameInputCard.classList.remove('translate-y-[700px]')
    usernameInputCardParent.classList.remove('pointer-events-none')
  }

</script>

<div id="window" class="w-screen h-[100svh] bg-gray1 select-none">
  <div class="w-full h-full flex flex-col">
    <div id="topWrapper" class=" w-full h-[190px]">
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
        <div class="w-[99%] h-full bg-gray2 border-b-[4px] border-x-[4px] border-neutral-700 rounded-br-[25px] rounded-bl-[25px] px-[8px] py-[7px]">
          <div class="w-full h-full font-normal font-semibold text-[13px] relative">
            <button class="w-full h-[45%]" on:click={clearUsername}>
              <div class="w-full h-full bg-neutral-800 rounded-[13px] flex text-white justify-center items-center">
                <span>Reset Username</span>
              </div>
            </button>
            <button class="w-full h-[45%] mt-2">
              <div class="w-full h-full bg-darkred rounded-[13px] flex text-white justify-center items-center">
                <span>Leave the Lectionary</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
    <div id="bottomWrapper" class="flex-grow w-full">
      <div class="w-full h-full relative">
        <div id="usernameInputCardParent" class="w-full h-full absolute z-10">
          <div id="usernameInputCard" class="relative w-full h-full transition duration-[800ms] ">
            <div class="w-full h-full bg-gray2 rounded-tr-[40px] rounded-tl-[40px] border-[2px] border-accent">
              <div class="w-full h-2/3">
                <div class="w-full h-[45%] ">
                  <div class="w-full h-full flex justify-center items-center">
                    <p class=" text-primary font-title font-bold italic text-[60px]">
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
              <div class="w-full h-1/3 relative text-neutral-700">
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
          <div id="OtherScreens" class=" w-full h-full ">
            <div class="w-full h-full flex flex-col justify-end">
              <div class="w-full h-[25%] ">
                <div class="w-full h-full flex justify-center items-center">
                  <p class="text-center w-[70%] text-[18px] text-neutral-800 font-normal font-semibold">
                    Join a lectionary using an educator-provided PIN.
                  </p>
                </div>
              </div>
              <div class="w-full h-[60%]">
                <div class="w-full h-[60%] flex justify-center items-center">
                  <div class="w-[90%] h-[90%]">
                    <div class="w-full h-full bg-white rounded-[20px]  border-secondary border-[2.5px] shadow-xl py-[8px] px-[14px]">
                      <div class="w-full h-full flex flex-col">
                        <div class="w-[100] h-[44%] rounded-[10px] mb-2 mt-[7px]">
                          <input 
                            type="number" 
                            class="w-full h-full text-[18px] font-normal border-2 border-accent focus:border-[4px] text-accent text-center rounded-[10px] focus:outline-none transition-all duration-75" 
                            placeholder="Lectionary PIN"
                            bind:value={joincodeField}
                            pattern="[0-9]+"
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
                <div class="w-full h-[40%]">

                </div>
              </div>
              <div class="w-full h-[15%] flex justify-center items-center">
                <p class="w-2/3 text-center text-[14px] font-normal text-neutral-700">
                  Create your own Lectionary for FREE at
                  <span class="font-bold">
                    <a href="http://lection.cc/" target="_blank">
                      Lection.cc
                    </a>
                  </span>  
                </p>
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
</style>
