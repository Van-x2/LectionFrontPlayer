<script>
  import { onMount } from 'svelte'

  //temp variables, will be replaced with actual staged user input
  let joincodeField = ''
  let nameField = ''
  let currentprompt = 0
  let answerField = ''
  let confidenceValue = '3'
  let menuOpen = false

  //page elements
  let menuCard
  let menuIcon

  
  onMount(() => {
  menuCard = document.getElementById('menu')
  menuIcon = document.getElementById('menuIcon')

  })


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

  function leaveLobby() {
    console.log('left the lobby')
  }

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

</script>

<div id="window" class="w-screen h-screen bg-gray1">
  <div class="w-full h-full flex flex-col">
    <div id="topWrapper" class=" w-full h-[270px] ">
      <div id="nav" class="w-full h-20 relative bg-white shadow-lg z-10">
        <div class="w-full h-full flex relative">
          <div class="h-20 w-20 bg-primary flex items-center justify-center">
            <span class=" text-white text-[65px] font-title font-bold italic absolute">L</span>
            <div class="w-full h-full relative">
              <div class="w-4 h-4 absolute bottom-[4px] right-[4px]">
                <div class="w-full h-full relative">
                  <div class="w-[4px] h-[15px] bg-white absolute bottom-0 right-0"></div>
                  <div class="w-[15px] h-[4px] bg-white absolute bottom-0 right-0"></div>
                </div>
              </div>
            </div>
          </div>
          <div class="h-20 w-20 bg-white right-0 absolute">
            <div class="w-full h-full">
              <div id="menuIcon" class="w-full h-full flex items-center justify-center transition-all duration-300">
                <button on:click={menuIconClicked}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="size-14 fill-neutral-800 stroke-neutral-800 stroke-[0.8px]">
                    <path d="M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75ZM3 12a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm0 5.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z" clip-rule="evenodd" />
                  </svg>
                </button>     
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="menu" class="w-full h-40 flex justify-center z-9  transition-all -translate-y-40 duration-300 absolute">
        <div class="w-[99%] h-full bg-gray2 border-b-[4px] border-x-[4px] border-neutral-700 rounded-br-[30px] rounded-bl-[30px] p-[10px]">
          <div class="w-full h-full font-normal font-semibold text-[17px]">
            <button class="w-full h-[44%] mt-[5px] mb-[7px]">
              <div class="w-full h-full bg-neutral-800 rounded-[13px] flex text-white justify-center items-center">
                <span>Reset Username</span>
              </div>
            </button>
            <button class="w-full h-[44%] my-[6px]">
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
        <div class="w-full h-full absolute z-10">
          <div id="UsernameInputCard" class="relative w-full h-full">
            <div class="w-full h-full bg-gray2  rounded-tr-[40px] rounded-tl-[40px] border-[2px] border-accent">
              <div class="w-full h-2/3">
                <div class="w-full h-[40%] ">
                  <div class="w-full h-full flex justify-center items-center">
                    <p class=" text-primary font-title font-bold italic text-[70px]">
                      Lection
                    </p>
                  </div>
                </div>
                <div class="w-full h-[60%] flex justify-center">
                  <div class="w-[88%] h-[185px] ">
                    <div class="w-full h-full bg-white rounded-[20px]  border-secondary border-[2.5px] shadow-xl py-[8px] px-[14px]">
                      <div class="w-full h-full flex flex-col">
                        <div class="w-[100] h-[44%] rounded-[10px] border-2 border-accent mb-2 mt-[7px]">
                          <input type="text" class="w-full h-full text-[18px] font-normal text-accent text-center rounded-[10px] focus:outline-none" placeholder="Username">
                        </div>
                        <button class="w-[100%] h-[44%] mb-2">
                          <div class="w-full h-full rounded-[10px] bg-neutral-800 mb-2 ">
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
                  <div class="w-full h-3/4 ">
                    <div class="w-full h-full flex justify-center items-end">
                      <div class="w-2/3 h-2/3">
                        <p class="  font-normal text-[18px] text-center">
                          Create your own Lectionary for FREE at 
                          <span class="font-semibold">Lection.cc</span> 
                        </p>
                      </div>
                    </div>
                  </div>
                  <div class="w-full h-1/4 flex font-normal font-semibold text-[16px]">
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
        <div class="w-full h-full absolute z-0">
          <div id="OtherScreens" class="relative w-full h-full">

          </div>
        </div>
      </div>
    </div>
  </div>
  
</div>

