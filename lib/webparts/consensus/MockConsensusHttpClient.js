var MockConsensusHttpClient = /** @class */ (function () {
    function MockConsensusHttpClient() {
    }
    MockConsensusHttpClient.prototype.getRequirements = function () {
        return new Promise(function (resolve) {
            resolve(MockConsensusHttpClient._items);
        }).then(function (data) {
            var listData = { value: data };
            return listData;
        });
    };
    MockConsensusHttpClient.prototype.getScoresForRequirementNum = function (reqNum, vendorId) {
        return new Promise(function (resolve) {
            resolve(MockConsensusHttpClient._scores);
        }).then(function (data) {
            var listData = { value: data };
            return listData;
        });
    };
    MockConsensusHttpClient.prototype.getScoresForVendorId = function (vendorId) {
        return null;
    };
    MockConsensusHttpClient._items = [
        {
            Title: 'Organisational Capacity and Capability (30%)',
            ID: 1,
            RequirementNumber: '6.1',
            Parent: '',
            Description: '',
            IsBundle: false
        },
        {
            Title: 'Company history and background',
            ID: 2,
            RequirementNumber: '6.1.1',
            Parent: '6.1',
            Description: '',
            IsBundle: false
        },
        {
            Title: 'Skills and experience',
            ID: 3,
            RequirementNumber: '6.1.2',
            Parent: '6.1',
            Description: '',
            IsBundle: false
        },
        {
            Title: 'Quality management',
            ID: 4,
            RequirementNumber: '6.1.3',
            Parent: '6.1',
            Description: '',
            IsBundle: false
        },
        {
            Title: 'Complex technology and system development project',
            ID: 5,
            RequirementNumber: '6.1.4',
            Parent: '6.1',
            Description: '',
            IsBundle: false
        },
        {
            Title: 'Other relevant service management frameworks, methodolgies and standards',
            ID: 6,
            RequirementNumber: '6.1.5',
            Parent: '6.1',
            Description: '',
            IsBundle: false
        },
        {
            Title: 'Company history and background',
            ID: 10,
            RequirementNumber: '6.1.1a',
            Parent: '6.1.1',
            Description: '',
            IsBundle: false
        }
        //
        ,
        {
            Title: 'Company values and culture',
            ID: 11,
            RequirementNumber: '6.1.1b',
            Parent: '6.1.1',
            Description: '',
            IsBundle: false
        },
        {
            Title: 'Company structure, number of personnel and include a structure diagram',
            ID: 12,
            RequirementNumber: '6.1.1c',
            Parent: '6.1.1',
            Description: '',
            IsBundle: false
        },
        {
            Title: 'Details of the company’s lines of business and how it relates to this Contract',
            ID: 13,
            RequirementNumber: '6.1.1d',
            Parent: '6.1.1',
            Description: '',
            IsBundle: false
        },
        {
            Title: 'If the company is national or international, explain the level of delegated authority the local team has to make decisions with regard to the Contract, and under what circumstances decisions would need to be escalated to national or international levels',
            ID: 14,
            RequirementNumber: '6.1.1e',
            Parent: '6.1.1',
            Description: '',
            IsBundle: false
        },
        {
            Title: 'Suitability of Proposed Services (25%)',
            ID: 7,
            RequirementNumber: '6.2',
            Parent: '',
            Description: '',
            IsBundle: false
        },
        {
            Title: 'Overall approach to provision of services',
            ID: 8,
            RequirementNumber: '6.2.1',
            Parent: '6.2',
            Description: '',
            IsBundle: false
        },
        {
            Title: 'Approach to provision of services by bundle',
            ID: 9,
            RequirementNumber: '6.2.2',
            Parent: '6.2',
            Description: '',
            IsBundle: false
        },
        {
            Title: 'Demonstrated Experience (25%)',
            ID: 15,
            RequirementNumber: '6.3',
            Parent: '',
            Description: '',
            IsBundle: false
        },
        {
            Title: 'Transition Management (10%)',
            ID: 16,
            RequirementNumber: '6.4',
            Parent: '',
            Description: '',
            IsBundle: false
        },
        {
            Title: 'Participation Plan (10%)',
            ID: 17,
            RequirementNumber: '6.5',
            Parent: '',
            Description: '',
            IsBundle: false
        }
    ];
    MockConsensusHttpClient._scores = [
        {
            ID: 1,
            VendorID: 1,
            RequirementNumber: "6.1.1a",
            Score: 8,
            ScoreType: 'EP',
            CommentText: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
            EnteredBy: [{ Title: 'Maddy' }],
            EnteredById: '13',
            ConsensusComment: '',
            ConsensusScore: 0,
            WeightedScore: 1
        },
        {
            ID: 2,
            VendorID: 1,
            RequirementNumber: "6.1.1a",
            Score: 4,
            ScoreType: 'EP',
            CommentText: "JAMES SAID - Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
            EnteredBy: [{ Title: 'Maddy' }],
            EnteredById: '13',
            ConsensusComment: '',
            ConsensusScore: 0,
            WeightedScore: 1
        },
        {
            ID: 3,
            VendorID: 1,
            RequirementNumber: "6.1.1a",
            Score: 7,
            ScoreType: 'EP',
            CommentText: "Dummy comments.",
            EnteredBy: [{ Title: 'Maddy' }],
            EnteredById: '13',
            ConsensusComment: '',
            ConsensusScore: 0,
            WeightedScore: 1
        },
        {
            ID: 4,
            VendorID: 1,
            RequirementNumber: "6.1.1b",
            Score: 4,
            ScoreType: 'EP',
            CommentText: "JAMES SAID - Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
            EnteredBy: [{ Title: 'Maddy' }],
            EnteredById: '13',
            ConsensusComment: '',
            ConsensusScore: 0,
            WeightedScore: 1
        },
        {
            ID: 5,
            VendorID: 1,
            RequirementNumber: "6.1.1b",
            Score: 7,
            ScoreType: 'Consensus',
            CommentText: "Alex - Dummy comments.",
            EnteredBy: [{ Title: 'Maddy' }],
            EnteredById: '13',
            ConsensusComment: '',
            ConsensusScore: 0,
            WeightedScore: 1
        },
        {
            ID: 6,
            VendorID: 1,
            RequirementNumber: "6.2.1",
            Score: 6,
            ScoreType: 'EP',
            CommentText: "Lisa SAID - Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
            EnteredBy: [{ Title: 'Maddy' }],
            EnteredById: '13',
            ConsensusComment: '',
            ConsensusScore: 0,
            WeightedScore: 1
        },
        {
            ID: 7,
            VendorID: 1,
            RequirementNumber: "6.2.1",
            Score: 7,
            ScoreType: 'Consensus',
            CommentText: "Jack - Dummy comments.",
            EnteredBy: [{ Title: 'Maddy' }],
            EnteredById: '13',
            ConsensusComment: '',
            ConsensusScore: 0,
            WeightedScore: 1
        },
    ];
    return MockConsensusHttpClient;
}());
export default MockConsensusHttpClient;
//# sourceMappingURL=MockConsensusHttpClient.js.map