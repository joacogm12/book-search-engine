const { User } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth')

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: constext.user._id })
                return userData
            }
            throw new AuthenticationError('No user found with that id')
        }
    },

    Mutation: {
        createUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);
            return { token, user };
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError('No user found!');
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Wrong password!');
            }

            const token = signToken(user);
            return { token, user };
        },
        saveBook: async (parent, { bookData }, context) => {
            const { user } = context
            const updateUser = await User.findOneAndUpdate(
                { _id: user._id },
                { $addToSet: { savedBooks: bookData } },
                { new: true }
            )
            return updateUser;
        },
        removeBook: async (parent, { bookId }, context) => {
            const { user } = context
            const updateUser = await User.findOneAndUpdate(
                { _id: user._id },
                { $pull: { savedBooks: { bookId: bookId } } },
                { new: true }
            );
            return updateUser;
        }
    }
}