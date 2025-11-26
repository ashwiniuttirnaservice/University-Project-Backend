const permissions = {
  admin: { "*": ["create", "read", "update", "delete"] },
  trainer: {
    course: ["create", "read", "update"],
    session: ["create", "read", "update"],
    lecture: ["create", "read", "update"],
    meeting: ["read"],
    batches: ["create", "read", "update"],
    curriculum: ["create", "read", "update"],
    assignment: ["create", "read", "update"],

    meeting: ["read"],
    test: ["create", "read", "update"],

    student: ["read"],
  },
};
