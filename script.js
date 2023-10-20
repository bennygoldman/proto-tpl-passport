/* 
// // // // // // // // // // // // // // // // // // // // // // 
// // // // // // // // // // // // // // // // // // // // // // 
DONE: 
-- Exclude non-physical branches
-- Refactor recording the visit inside of createPassportPage and call it from there
-- Add a way to get the stamp status
-- Get kidFriendly/teenFriendly thing going

TO DO:
-- Add ways to get total visits to all branches + all stamps
-- Build front-end
-- Bring back Favorite Book + also add selector for home branch

// // // // // // // // // // // // // // // // // // // // // // 
// // // // // // // // // // // // // // // // // // // // // // 
*/

let setLibrary;
const form = document.getElementById('signUp');
form.addEventListener('submit', handleSubmit);
const URL_TORONTO_PUBLIC_LIBRARY = 'response.json';

function createBranch(branchData) {
    const {
        _id,
        BranchCode,
        BranchName,
        Address,
        WardName,
        Website,
        PresentSiteYear,
        KidsStop,
        LeadingReading,
        YouthHub,
        TeenCouncil,
    } = branchData;

    const kidServices = {
        kidsStop: KidsStop,
        leadingReading: LeadingReading,
    };

    const teenServices = {
        youthHub: YouthHub,
        teenCouncil: TeenCouncil,
    };

    return {
        _id,
        kidServices: kidServices,
        teenServices: teenServices,
        branch_code: BranchCode,
        branch_name: BranchName,
        address: Address,
        url: Website,
        ward: WardName,
        open_since: PresentSiteYear,
    };
}

function createPassport({ userName, userType }) {
    return { userName, userType };
}

function createPassportPage(processedBranch) {
    const page = {
        ...processedBranch,
        stamp: false,
        visitCount: 0,
    };
    return page;
}

const processPassportApplication = (formData, library) => {
    const dateCreated = new Date().toLocaleDateString();
    const uuid = crypto.randomUUID().toString();
    const passport = createPassport(formData);
    const pages = library.map(branch => processPassportPageData(branch));
    passport.dateCreated = dateCreated;
    passport.uuid = uuid;
    passport.pages = pages;
    console.log(`Passport created for: ${formData.userName}`);
    console.log(passport);
    const selectedPage = passport.pages[43];
    console.log(`No visit yet...`);
    console.log(`Visit Count: ${selectedPage.visitCount} Stamp Status: ${selectedPage.stamp}`);
    selectedPage.addVisit();
    console.log('After first visit...');
    console.log(`Visit Count: ${selectedPage.visitCount} Stamp Status: ${selectedPage.stamp}`);
    selectedPage.addVisit();
    console.log('After second visit...');
    console.log(`Visit Count: ${selectedPage.visitCount} Stamp Status: ${selectedPage.stamp}`);

    return {
        passport
    };
};

const processPassportPageData = (processedBranch) => {
    const page = createPassportPage(processedBranch);
    page.visitData = []; // explore making this an object instead

    page.addVisit = function () {
        page.visitCount++;
        if (!page.stamp) {
            page.stamp = true;
        }
        const date = new Date();
        page.visitData.push(date);
    };

    return page;
};

const processBranchData = (branchData) => {
    const branch = createBranch(branchData);
    const isKidFriendly = Object.values(branch.kidServices).some(value => value === 1);
    const isTeenFriendly = Object.values(branch.teenServices).some(value => value === 1);

    return {
        _id: branch._id,
        branch_code: branch.branch_code,
        branch_name: branch.branch_name,
        address: branch.address,
        ward: branch.ward,
        url: branch.url,
        open_since: branch.open_since,
        isKidFriendly,
        isTeenFriendly,
    };
};

function handleSubmit(e) {
    e.preventDefault();
    if (form.elements.userName.value && form.elements.userType.value) {
        const data = { userName: form.elements.userName.value, userType: form.elements.userType.value };
        // console.log(data);
        processPassportApplication(data, setLibrary);
        e.target.reset();
    }
};

async function fetchLibraryData(apiUrl) {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const data = await fetchLibraryData(URL_TORONTO_PUBLIC_LIBRARY);
        setLibrary = data.result.records
            .filter(branch => branch.PhysicalBranch === 1)
            .map(branch => processBranchData(branch));
        // console.log(setLibrary);
    } catch (error) {
        console.error('Error:', error);
    }
});

const snippets = {
    sort_text: ` const byWard = setLibrary.sort((a, b) => {
        return a.ward.toLowerCase().localeCompare(b.ward.toLowerCase());

    });
    console.log(byWard);`,

    fetch_helper: `function fetchLibraryData() {
        return fetch('response.json')
       .then(response => response.json());
       }`
};
