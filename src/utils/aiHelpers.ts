import { GoogleGenerativeAI } from '@google/generative-ai';

export const generateScript = async (apiKey: string, userRequest: string, currentScript: string = '') => {
  if (!apiKey) {
    throw new Error('Please add your Google API key first');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const basePrompt = `
    You are a shell script generator. Analyze the current shell script and modify it based on this request: "${userRequest}"
    
    Important rules:
    1. If the script is empty, create a new script with ONLY what was requested
    2. If adding a new menu category, preserve all existing menus and add the new one
    3. If modifying an existing menu, only change that specific menu's items
    4. Always include these basic checks at the start:
       #!/bin/bash
       
       # Check if whiptail is installed
       if ! command -v whiptail &> /dev/null; then
           echo "Whiptail is not installed. Installing it now..."
           sudo apt-get install -y whiptail
       fi
    
    5. For package installations:
       - Add repository commands BEFORE the menu
       - Update package lists before installing
       - Handle installation errors
       - Show clear success/error messages
    
    6. Menu format must be:
       CHOICE=$(whiptail --title "Menu Title" \\
           --menu "Select option:" 15 60 4 \\
           "1" "Option 1" \\
           "2" "Option 2" \\
           3>&1 1>&2 2>&3)

       case $CHOICE in
           1)
               # Handle option 1
               ;;
           2)
               # Handle option 2
               ;;
           *)
               echo "Invalid option or cancelled"
               exit 1
               ;;
       esac
    
    7. For browser installations:
       case $CHOICE in
           1)
               echo "Installing Firefox..."
               sudo add-apt-repository -y ppa:mozillateam/ppa
               sudo apt update
               sudo apt install -y firefox
               ;;
           2)
               echo "Installing Brave Browser..."
               sudo curl -fsSLo /usr/share/keyrings/brave-browser-archive-keyring.gpg https://brave-browser-apt-release.s3.brave.com/brave-browser-archive-keyring.gpg
               echo "deb [signed-by=/usr/share/keyrings/brave-browser-archive-keyring.gpg] https://brave-browser-apt-release.s3.brave.com/ stable main" | sudo tee /etc/apt/sources.list.d/brave-browser-release.list
               sudo apt update
               sudo apt install -y brave-browser
               ;;
           3)
               echo "Installing Google Chrome..."
               wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
               sudo sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
               sudo apt update
               sudo apt install -y google-chrome-stable
               ;;
       esac
    
    8. Always handle user cancellation:
       if [ $? -ne 0 ]; then
           echo "Action canceled by user"
           exit 1
       fi
    
    Current script content (preserve existing menus):
    ${currentScript}
    
    Return ONLY the complete shell script with all menus (existing + new/modified), no explanations.
    The script should start with #!/bin/bash and include all necessary checks.
  `;

  try {
    const result = await model.generateContent(basePrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating script:', error);
    throw new Error('Failed to generate script. Please try again.');
  }
};