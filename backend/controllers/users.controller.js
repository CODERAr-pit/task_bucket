import { User } from "../models/User.js";

// Get all users (remove domain filtering)
const getUsersInDomain = async (req, res) => {
    try {
        // Remove domain filtering - show all users for task assignment
        // const userDomain = req.user.domain;
        
        // Get all users regardless of domain
        const users = await User.find({})
            .select('name email role avatar domain')
            .sort({ name: 1 });

        const formattedUsers = users.map(user => ({
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            domain: user.domain // Include domain for display
        }));

        res.status(200).json({
            success: true,
            users: formattedUsers
        });

    } catch (error) {
        console.error('Error in getUsersInDomain:', error);
        res.status(500).json({
            error: 'Failed to fetch users',
            details: error.message
        });
    }
};

// Get users with filtering options for domain-specific assignment
const getUsersFiltered = async (req, res) => {
    try {
        const { domain, role, roles, domains } = req.query;
        
        let query = {};
        
        // Filter by single domain
        if (domain && domain !== 'all') {
            query.domain = domain;
        }
        
        // Filter by multiple domains
        if (domains) {
            const domainArray = Array.isArray(domains) ? domains : domains.split(',');
            query.domain = { $in: domainArray };
        }
        
        // Filter by single role
        if (role && role !== 'all') {
            query.role = role;
        }
        
        // Filter by multiple roles
        if (roles) {
            const roleArray = Array.isArray(roles) ? roles : roles.split(',');
            query.role = { $in: roleArray };
        }
        
        // console.log('🔍 getUsersFiltered query:', query);
        
        const users = await User.find(query)
            .select('_id name email role domain avatar')
            .sort({ role: 1, name: 1 }) // Sort by role first, then name
            .lean();

        const formattedUsers = users.map(user => ({
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            domain: user.domain
        }));
        
        // Group users by domain and role for easier frontend handling
        const groupedUsers = formattedUsers.reduce((acc, user) => {
            const key = `${user.domain}-${user.role}`;
            if (!acc[key]) {
                acc[key] = {
                    domain: user.domain,
                    role: user.role,
                    users: []
                };
            }
            acc[key].users.push(user);
            return acc;
        }, {});
        
        res.status(200).json({
            success: true,
            users: formattedUsers,
            grouped: groupedUsers,
            totalCount: formattedUsers.length,
            filters: { domain, role, roles }
        });
        
    } catch (error) {
        console.error('Error fetching filtered users:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch users',
            details: error.message
        });
    }
};

// Get available filter options
const getFilterOptions = async (req, res) => {
    try {
        // Get unique domains and roles
        const domains = await User.distinct('domain');
        const roles = await User.distinct('role');
        
        // Get count by domain and role combinations
        const combinations = await User.aggregate([
            {
                $group: {
                    _id: { domain: '$domain', role: '$role' },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.domain': 1, '_id.role': 1 }
            }
        ]);
        
        res.status(200).json({
            success: true,
            domains: domains.sort(),
            roles: roles.sort(),
            combinations: combinations.map(combo => ({
                domain: combo._id.domain,
                role: combo._id.role,
                count: combo.count
            }))
        });
        
    } catch (error) {
        console.error('Error fetching filter options:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch filter options',
            details: error.message
        });
    }
};

export { getUsersInDomain, getUsersFiltered, getFilterOptions };
