function formValidator(){
    let x = document.forms["my_form"]["full_name"].value
    if (x == ""){
        alert("A név mező nincs kitöltve");
        return false;
    }
    else if (!/^[A-Za-z].*[A-Za-z0-9]$/.test(document.forms["my_form"]["full_name"].value)){
        alert("Helytelen név formátum");
        return false;
    }
    let checkboxes = document.forms["my_form"].querySelectorAll('input[type="checkbox"]')
    let isChecked = false;
    for (var i = 0; i < checkboxes.length; i++){
        if(checkboxes[i].checked){
            isChecked = true;
            break;
        }
    }
    if (!isChecked){
        alert("Legalább egy műveletet ki kell válassz")
        return false;
    }
}