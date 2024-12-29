export const packageManagerTemplate = `#!/bin/bash

# Check if whiptail is installed
if ! command -v whiptail &> /dev/null; then
    echo "Whiptail is not installed. Installing it now..."
    sudo apt-get install -y whiptail
fi

# Display the main menu
MAIN_OPTION=$(whiptail --title "Package Manager" \\
    --menu "Select an option:" 15 60 2 \\
    "1" "Install Packages" \\
    "2" "Uninstall Programs" \\
    3>&1 1>&2 2>&3)

# Check if user canceled
if [ $? -ne 0 ]; then
    echo "Action canceled by user"
    exit 1
fi

case $MAIN_OPTION in
    1)
        # Your script here - menus will be added based on user requests
        ;;
    2)
        echo "Uninstall option selected"
        exit 0
        ;;
    *)
        echo "Invalid option or canceled"
        exit 1
        ;;
esac`;
