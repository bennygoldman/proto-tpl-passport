function Passport(name, favoriteBook) {
    this.name = name;
    this.favoriteBook = favoriteBook;
    this.visits = {};

    this.addVisit = (branch) => {
        if (!this.visits[branch._id]) {
            this.visits[branch._id] = 0;
        }
        this.visits[branch._id]++;
        branch.addVisit();
    };

    this.getVisits = (branch) => {
        return this.visits[branch._id] || 0;
    };

}

function Branch(data, passport) {
    this._id = data._id;
    this.branchName = data.BranchName;
    this.address = data.Address;
    this.url = data.Website;
    this.openSince = data.PresentSiteYear;
    this.stamp = false;
    this.timesVisited = 0;
    this.kidFriendly = {
        kidsStop: data.KidsStop,
        leadingReading: data.LeadingReading,
        youthHub: data.YouthHub,
        dih: data.DIH,
        teenCouncil: data.TeenCouncil,
    };

    this.addVisit = () => {

        ///////////
        if (passport) {
            passport.addVisit(this);
        }
        ///////////
        if (this.timesVisited === 0) {
            // Mark the branch as visited on the first visit.
            this.stamp = true;
            console.log('congratulations on your first visit');
        }
        this.timesVisited++;
    };

    this.isKidFriendly = () => {
        for (const key in this.kidFriendly) {
            if (this.kidFriendly[key] === 1) {
                return true;
            }
        }
        return false; // None of the elements in kidFriendly is true
    };

}

function fetchLibraryData() {
    return fetch('response.json')
        .then(response => response.json());
}

function createBranches(data) {
    const records = data.result.records;
    const branches = [];
    records.forEach(record => {
        if (record.PhysicalBranch) {
            const branch = new Branch(record);
            branches.push(branch);
        }
    });
    return branches;
}

document.addEventListener('DOMContentLoaded', () => {
    fetchLibraryData()
        .then(data => {
            const branches = createBranches(data);
            return branches;
            // console.log(branches);
        })
        .then(branches => {
        })
        .catch(error => {
            console.error('Error:', error);
        });
});

const passport = new Passport('Jon Doe', 'Frankenstein')

