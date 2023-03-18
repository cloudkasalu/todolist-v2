

exports.getDay = () => {
    
    let date = new Date();
    let options = {weekday: 'long',day:"numeric", month:"long", year: 'numeric' }
    return  day = date.toLocaleDateString("en-US", options)
}