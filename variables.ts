export const server = "https://asteriskpi.orians.org/";
export const username = "admin";
export const password = "changemeaj";

//TrunkName, sipServer, phoneNumber, username, password
export const siptrunks = [
];

//Number + name + password
export const deviceextensions = [
["201", "Desktop", "fakepassword"],
["202", "A.J. IPhone", "fakepassword"]
];

//Number + name + extensions
export const ringgroups = [
["290", "Test Ring Group", ["201", "202"]]
];
