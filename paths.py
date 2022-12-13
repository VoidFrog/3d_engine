vertices = []
lines = []

with open('./OpenGlPipelineBased_Webpacked/models/path3_for_ai3.obj', encoding = 'utf-8') as f:
    for line in f:
        if line[0] == 'v':
            line = line.replace('\n', '')
            splitted = line.split(' ')
            splitted.pop(0)
            vertices.append(splitted)

        elif line[0] == 'l':
            line = line.replace('\n', '')
            splitted = line.split(' ')
            splitted.pop(0)
            lines.append(splitted)


# print(vertices)
str_vertices = str(vertices)
str_vertices = str_vertices.replace(' ', '')
str_lines = str(lines)
str_lines = str_lines.replace(' ', '')
print(str_lines)
print(str_vertices)
print('blablabla;')