const {
    fetchGroupsWithSubgroups,
    calculatePipelineCounts,
    containsSubgroupWithNames,
} = require('../services/gitlab.service');

exports.getGitlabGroups = async (req, res) => {
    try {
        const { dateFilter = 'all', statusFilter = 'all' } = req.query;
        const groups = await fetchGroupsWithSubgroups();
        await calculatePipelineCounts(groups, dateFilter, statusFilter);

        const filteredGroups = groups.filter(group =>
            containsSubgroupWithNames(group, ['CI-CD', 'APPS'])
        );

        res.json(filteredGroups);
    } catch (error) {
        console.error('Groups error:', error);
        res.status(500).json({ error: error.message });
    }
};
