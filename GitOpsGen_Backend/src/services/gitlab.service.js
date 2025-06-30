const fetch = require('node-fetch');
const GITLAB_TOKEN = process.env.GITLAB_TOKEN;

async function fetchGroupsWithSubgroups(parentId = null) {
    const url = parentId
        ? `https://gitlab.com/api/v4/groups/${parentId}/subgroups?per_page=100`
        : `https://gitlab.com/api/v4/groups?min_access_level=20&per_page=100`;

    const res = await fetch(url, {
        headers: { 'PRIVATE-TOKEN': GITLAB_TOKEN }
    });

    if (!res.ok) return [];

    const groups = await res.json();
    return Promise.all(groups.map(async group => ({
        id: group.id,
        name: group.name,
        fullPath: group.full_path,
        pipelineCount: 0,
        successCount: 0,
        failureCount: 0,
        canceledCount: 0,
        averageDuration: 0,
        children: await fetchGroupsWithSubgroups(group.id),
    })));
}

async function fetchProjectsFromGroup(groupId) {
    const res = await fetch(
        `https://gitlab.com/api/v4/groups/${groupId}/projects?per_page=100`,
        { headers: { 'PRIVATE-TOKEN': GITLAB_TOKEN } }
    );
    if (!res.ok) return [];
    const projects = await res.json();
    return projects.map(p => p.id);
}

function isWithinFilterDate(createdAt, dateFilter) {
    if (!createdAt) return false;
    const createdDate = new Date(createdAt);
    const now = new Date();
    if (dateFilter === 'day') return createdDate.toDateString() === now.toDateString();
    if (dateFilter === 'week') {
        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(now.getDate() - 7);
        return createdDate >= oneWeekAgo;
    }
    return true;
}

async function fetchPipelineStats(projectId, dateFilter, statusFilter) {
    try {
        const res = await fetch(
            `https://gitlab.com/api/v4/projects/${projectId}/pipelines?per_page=50`,
            { headers: { 'PRIVATE-TOKEN': GITLAB_TOKEN } }
        );

        if (!res.ok) return defaultStats();

        const pipelines = await res.json();
        let total = 0, success = 0, failed = 0, canceled = 0, totalDuration = 0, counted = 0;

        for (const p of pipelines) {
            if (!isWithinFilterDate(p.created_at, dateFilter)) continue;
            if (statusFilter !== 'all' && p.status !== statusFilter) continue;

            total++;
            if (p.status === 'success') success++;
            else if (p.status === 'failed') failed++;
            else if (p.status === 'canceled') canceled++;

            const detailRes = await fetch(
                `https://gitlab.com/api/v4/projects/${projectId}/pipelines/${p.id}`,
                { headers: { 'PRIVATE-TOKEN': GITLAB_TOKEN } }
            );
            if (detailRes.ok) {
                const detail = await detailRes.json();
                const start = detail.started_at ? new Date(detail.started_at) : null;
                const end = detail.finished_at ? new Date(detail.finished_at) : null;
                if (start && end && end > start) {
                    totalDuration += (end - start) / 1000;
                    counted++;
                }
            }
        }

        return {
            total, success, failed, canceled,
            averageDuration: counted > 0 ? totalDuration / counted : 0,
        };
    } catch (error) {
        console.error(`Pipeline stats error for project ${projectId}:`, error);
        return defaultStats();
    }
}

function defaultStats() {
    return { total: 0, success: 0, failed: 0, canceled: 0, averageDuration: 0 };
}

async function batchPromises(items, batchSize, fn) {
    let results = [];
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchResults = await Promise.all(batch.map(fn));
        results = results.concat(batchResults);
    }
    return results;
}

async function calculatePipelineCounts(groups, dateFilter, statusFilter) {
    for (const group of groups) {
        try {
            const projectIds = await fetchProjectsFromGroup(group.id);
            const stats = await batchPromises(projectIds, 20, pid => fetchPipelineStats(pid, dateFilter, statusFilter));

            group.pipelineCount = stats.reduce((sum, s) => sum + s.total, 0);
            group.successCount = stats.reduce((sum, s) => sum + s.success, 0);
            group.failureCount = stats.reduce((sum, s) => sum + s.failed, 0);
            group.canceledCount = stats.reduce((sum, s) => sum + s.canceled, 0);

            const valid = stats.filter(s => s.averageDuration > 0);
            group.averageDuration = valid.length > 0
                ? valid.reduce((sum, s) => sum + s.averageDuration, 0) / valid.length
                : 0;

            if (group.children.length > 0) {
                await calculatePipelineCounts(group.children, dateFilter, statusFilter);
                for (const child of group.children) {
                    group.pipelineCount += child.pipelineCount;
                    group.successCount += child.successCount;
                    group.failureCount += child.failureCount;
                    group.canceledCount += child.canceledCount;

                    if (child.averageDuration > 0) {
                        group.averageDuration = group.averageDuration > 0
                            ? (group.averageDuration + child.averageDuration) / 2
                            : child.averageDuration;
                    }
                }
            }
        } catch (error) {
            console.error(`Error processing group ${group.id}:`, error);
        }
    }
}

function containsSubgroupWithNames(group, names) {
    for (const child of group.children) {
        if (names.includes(child.name)) return true;
        if (containsSubgroupWithNames(child, names)) return true;
    }
    return false;
}

module.exports = {
    fetchGroupsWithSubgroups,
    calculatePipelineCounts,
    containsSubgroupWithNames,
};
