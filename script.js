// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // 
// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // 
//                                                                                                                               //
//            DONE:                                                                                                              //   
//                    -- add logic on form submission to create branches if they haven't been created already                    //
//                    -- adjust the fetch calls                                                                                  // 
//                    -- Build front-end                                                                                         //
//                                                                                                                               //
// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // 
// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // 
//                                                                                                                               //
//            TO DO:                                                                                                             //
//                    -- Add ways to get total visits to all branches + all stamps                                               //
//                    -- Bring back Favorite Book                                                                                //
//                    -- Build utils to take most of this out of the main script                                                 //
//                    -- Functions for eventListeners                                                                            //
//                    -- Set the dropdown by setting the library (add a one option select menu)                                  //
//                    -- WRITE LOGIC TO ADD "SLUG" KEY INTO CREATEBRANCH - URL PART AFTER https:/www.tpl.ca/some-page            //
//                                                                                                                               //
// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // 
// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // 
//                                                                                                                               //
//           STYLES:                                                                                                             //
//                   -- Nav background: #001c71                                                                                  //
//                   -- Nav background hover: #0051B1                                                                            //
//                   -- Link: #005FC0                                                                                            //
//                   -- Link hover: #002A95                                                                                      //
//                   -- Font stack: Open Sans,Helvetica,Arial,sans-serif;                                                        //
//                   -- Logo: In assets folder                                                                                   //
//                                                                                                                               //
// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // 
// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // 


// import { testFunc } from "./lib/utils.js";

const URL_TORONTO_PUBLIC_LIBRARY = './data/response.json';

async function defineLibrary(apiUrl = URL_TORONTO_PUBLIC_LIBRARY) {
    try {
        const data = await fetchLibraryData(apiUrl);
        return data.result.records
            .filter(branch => branch?.PhysicalBranch === 1)
            .map(branch => processBranchData(branch));
    } catch (error) {
        console.error('Error fetching or processing library data:', error);
        return null;
    }
}

function createBranch(branchData) {

    const {
        // _id,
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

    const isKidFriendly = Object.values(kidServices).some(value => value === 1);
    const isTeenFriendly = Object.values(teenServices).some(value => value === 1);


    return {
        // _id,
        branch_code: BranchCode,
        branch_name: BranchName,
        address: Address,
        url: Website,
        ward: WardName,
        open_since: PresentSiteYear,
        isKidFriendly: isKidFriendly,
        isTeenFriendly: isTeenFriendly,
    };
}

const processBranchData = (branchData) => {
    const branch = createBranch(branchData);

    return {
        ...branch,
    };
};

function createPassport({ userName, userType, homeBranch }) {
    return { userName, userType, homeBranch };
}

function createPassportPage(branch) {
    const page = {
        ...branch,
        stamp: false,
        visitCount: 0,
        visitData: [], // explore making this an object instead
    };
    return page;
}

const processPassportApplication = async (formData, library) => {

    if (library === undefined) {
        library = await defineLibrary();
    }

    const passport = createPassport(formData);
    const dateCreated = new Date().toLocaleDateString();
    const uuid = crypto.randomUUID().toString();
    const pages = library.map(branch => processPassportPageData(branch));
    passport.dateCreated = dateCreated;
    passport.uuid = uuid;
    passport.pages = pages;
    const visitHalf = () => {
        const oddIndexedPages = passport.pages.filter((_, index) => index % 2 === 1);
        oddIndexedPages.forEach(page => page.addVisit());
    };
    visitHalf();
    displayPassport(passport);

    return {
        passport
    };
};

const processPassportPageData = (branch) => {
    const page = createPassportPage(branch);

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

function displayPassport({ userName, dateCreated, userType, homeBranch, pages }) {
    const passportSection = document.getElementById('user-passport');
    const passportProperties = [
        { label: 'User Name', value: userName },
        { label: 'Date Created', value: dateCreated },
        { label: 'User Type', value: userType },
        { label: 'Home Branch', value: homeBranch },
    ];

    passportProperties.forEach(({ label, value }) => {
        const propEl = document.createElement('p');
        propEl.textContent = `${label}: ${value}`;
        passportSection.appendChild(propEl);
    });

    pages.forEach(page => displayPassportPage(page));

}

function displayPassportPage({ branch_name, address, url, ward, open_since, stamp, visitCount, addVisit, branch_code }) {
    const passportSection = document.getElementById('user-passport');
    const pageEl = document.createElement('article');
    pageEl.id = branch_code;

    const pageProperties = [
        { label: 'Name', value: branch_name },
        { label: 'Address', value: address },
        { label: 'Website', value: url },
        { label: 'Neighborhood', value: ward },
        { label: 'Year Opened', value: open_since },
        // { label: 'Add Visit', value: addVisit },
        { label: 'Stamp', value: stamp ? 'Stamped' : 'Not Stamped' },
        { label: 'Visits', value: `${visitCount} visit${visitCount === 1 ? '' : 's'}` },
    ];

    pageProperties.forEach(({ label, value }) => {
        const propEl = document.createElement('p');
        propEl.textContent = `${label}: ${value}`;
        pageEl.appendChild(propEl);
    });

    const addVisitEl = document.createElement('button');
    addVisitEl.textContent = 'Check In';
    pageEl.appendChild(addVisitEl);

    passportSection.appendChild(pageEl);
}

function handleSubmit(e, form) {

    if (form.elements.userName.value && form.elements.userType.value && form.elements.branchSelect.value) {
        const data = { userName: form.elements.userName.value, userType: form.elements.userType.value, homeBranch: form.elements.branchSelect.value };
        // console.log("Form Data:");
        // console.log(data);
        processPassportApplication(data);
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

function initialLoad(apiUrl = URL_TORONTO_PUBLIC_LIBRARY) {
    const selectEl = document.getElementById('branchSelect');
    const form = document.getElementById('signUp');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        handleSubmit(e, form);
    });

    document.addEventListener('DOMContentLoaded', async () => {
        try {
            const data = await fetchLibraryData(apiUrl);

            data.result.records
                .filter(branch => branch?.PhysicalBranch === 1)
                .forEach(branch => {
                    if (branch.BranchCode && branch.BranchName) {
                        const option = document.createElement('option');
                        option.value = branch.BranchCode;
                        option.text = branch.BranchName;
                        selectEl.appendChild(option);
                    } else {
                        console.error('Missing branch code or branch name for a branch:', branch);
                    }
                });

        } catch (error) {
            console.error('Error:', error);
        }
    });
};

initialLoad(URL_TORONTO_PUBLIC_LIBRARY);