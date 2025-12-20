import { ref, computed } from 'vue'
import { defineStore } from 'pinia'


const studentStore = defineStore('student', {
    state: () => ({
        studentInfo: {
            id: '',
            studentId: '',
            studentName: '',
            gender: '',
            age: '',
            avatar: '',
            major: '',
            class: '',
            graduationYear: '',
            resumePath: '',
            status: '',
            role: '',
            accessToken: '',
            refreshToken: '',
            currentPartner:[],
            currentMessages:[]
        }

    }),
    actions: {
        setStudentInfo(data) {
            this.studentInfo = data;
        },
        clearstudentStorage() {
            this.$reset();
            localStorage.removeItem('studentinfo');
        }
    },
    persist: {
        key: 'studentinfo',
        storage: localStorage,
        paths: ['studentInfo']
    }
});

const manageStore = defineStore('manage', {
    state: () => ({
        manageInfo: {
            manageid: '',
            managename: '',
            mangaerole: '',
            accessToken: '',
            refreshToken: '',
            currentPartner:[],
            currentMessages:[]
        }
    }),
    actions: {
        setManageInfo(data) {
            this.manageInfo = data;
        },
        clearmanageStorage() {
            this.$reset();
            localStorage.removeItem('manageinfo');
        }
    },
        persist: {
            key: 'manageinfo',
            storage: localStorage,
            paths: ['manageInfo']
        }
});

const enterpriseStore = defineStore('enterprise', {
    state: () => ({
        enterpriseInfo: {
            enterpriseId: '',
            enterpriseName: '',
            contact_name: '',
            email: '',
            phone: '',
            role: '',
            accessToken: '',
            refreshToken: '',
            currentPartner:[],
            currentMessages:[]
        },
        isFirstLogin: false
    }),
    actions: {
        setEnterpriseInfo(data) {
            this.enterpriseInfo = data;
        },
        clearenterpriseStorage() {
            this.$reset();
            localStorage.removeItem('enterpriseinfo');
        }
    },
    persist: {
        key: 'enterpriseinfo',
        storage: localStorage,
        paths: ['enterpriseInfo']
    }
});



export {
    studentStore,
    manageStore,
    enterpriseStore
}


                                           