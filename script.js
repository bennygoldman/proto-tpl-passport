function createPassport(name, favoriteBook, ageGroup, branches) {
    const visits = {};

    function addVisit(branchPage) {
        if (!visits[branchPage._id]) {
            visits[branchPage._id] = 0;
        }
        visits[branchPage._id]++;
    }

    function getVisits(branchPage) {
        return visits[branchPage._id] || 0;
    }


    const passportPages = branches.map(branch => createPassportPage(branch));

    return {
        name,
        favoriteBook,
        ageGroup,
        visits,
        addVisit,
        getVisits,
        passportPages,
    };
}

function createBranch(data) {
    const {
        _id,
        BranchName,
        Address,
        NBHDName,
        WardName,
        Website,
        PresentSiteYear,
        KidsStop,
        LeadingReading,
        YouthHub,
        TeenCouncil,
    } = data;

    const kidServices = {
        kidsStop: KidsStop,
        leadingReading: LeadingReading,
    };

    const teenServices = {
        youthHub: YouthHub,
        teenCouncil: TeenCouncil,
    };

    function isKidFriendly() {
        for (const key in kidServices) {
            if (kidServices[key] === 1) {
                return true;
            }
        }
        return false;
    }

    function isTeenFriendly() {
        for (const key in teenServices) {
            if (teenServices[key] === 1) {
                return true;
            }
        }
        return false;
    }

    return {
        _id,
        branchName: BranchName,
        address: Address,
        neighborhood: NBHDName,
        ward: WardName,
        url: Website,
        openSince: PresentSiteYear,
        isKidFriendly,
        isTeenFriendly,
    };
}

function createPassportPage(branchData) {
    const { _id, branchName, address } = branchData;
    const page = {
        _id,
        branchName,
        address,
        stamp: false,
        visitCount: 0,
        recordVisit: function () {
            this.visitCount++;
            if (this.visitCount === 1) {
                this.stamp = true;
            }
        },

    };
    return page;
}

function fetchLibraryData() {
    return fetch('response.json')
        .then(response => response.json());
}

document.addEventListener('DOMContentLoaded', () => {
    fetchLibraryData()
        .then(data => {
            const branches = data.result.records;
            const branchReturn = branches.map(branch => createBranch(branch));
            const passport = createPassport('Jon Doe', 'Frankenstein', 'Kid', branchReturn);
            console.log('Passport created: ', passport);

            console.log('Name:', passport.name);
            console.log('Favorite Book:', passport.favoriteBook);
            console.log('Age Group:', passport.ageGroup);
            console.log('Visits:', passport.visits);

            const branchToVisit = passport.passportPages[0];
            console.log('Visits before adding: ', passport.getVisits(branchToVisit));
            passport.addVisit(branchToVisit);
            console.log('Visits after adding:', passport.getVisits(branchToVisit));

        })
        .catch(error => {
            console.error('Error:', error);
        });
});